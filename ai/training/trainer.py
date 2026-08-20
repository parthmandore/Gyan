"""
Gyan Multilingual TTS — Training Module

Handles:
- Training loop
- Validation loop
- Masked mel loss
- Mixed precision training
- Gradient clipping
- Gradient accumulation
- Checkpoint saving
- Checkpoint resume support
- Training history
- Early stopping state
- Learning-rate scheduler state
"""

import json
from pathlib import Path
from typing import Dict, Optional, Tuple

import torch
import torch.nn as nn
from torch.utils.data import DataLoader

from ai.configs.tts_config import TTSConfig


class TTSLoss(nn.Module):
    """
    Masked L1 loss for variable-length mel spectrograms.

    Padding frames are excluded from the loss calculation.
    """

    def __init__(self):
        super().__init__()

    def forward(
        self,
        coarse_mel: torch.Tensor,
        refined_mel: torch.Tensor,
        target_mel: torch.Tensor,
        mel_lengths: torch.Tensor,
    ) -> Tuple[torch.Tensor, Dict[str, float]]:

        _, _, max_mel_len = target_mel.shape

        positions = torch.arange(
            max_mel_len,
            device=target_mel.device,
        ).unsqueeze(0)

        mask = (
            positions < mel_lengths.unsqueeze(1)
        )

        mask = mask.unsqueeze(1).float()

        coarse_loss = torch.abs(
            coarse_mel - target_mel
        )

        coarse_loss = (
            coarse_loss * mask
        ).sum() / (
            mask.sum() * target_mel.size(1)
        )

        refined_loss = torch.abs(
            refined_mel - target_mel
        )

        refined_loss = (
            refined_loss * mask
        ).sum() / (
            mask.sum() * target_mel.size(1)
        )

        total_loss = (
            coarse_loss + refined_loss
        )

        metrics = {
            "coarse_loss": coarse_loss.item(),
            "refined_loss": refined_loss.item(),
            "total_loss": total_loss.item(),
        }

        return total_loss, metrics


class TTSTrainer:
    """
    Training manager for the Gyan Multilingual TTS model.

    Supports:
    - Mixed precision training
    - Gradient clipping
    - Gradient accumulation
    - Validation
    - Checkpoint saving
    - Automatic training state restoration
    - Training history
    - Early stopping state
    """

    def __init__(
        self,
        model: nn.Module,
        config: TTSConfig,
        device: torch.device,
    ):

        self.model = model.to(device)
        self.config = config
        self.device = device

        training_cfg = config.training

        # Optimizer
        self.optimizer = torch.optim.AdamW(
            self.model.parameters(),
            lr=training_cfg.learning_rate,
            weight_decay=training_cfg.weight_decay,
        )

        # Loss
        self.criterion = TTSLoss()

        # Learning-rate scheduler
        self.scheduler = (
            torch.optim.lr_scheduler.ReduceLROnPlateau(
                self.optimizer,
                mode="min",
                factor=0.5,
                patience=2,
            )
        )

        # Mixed precision
        self.use_amp = (
            training_cfg.use_amp
            and device.type == "cuda"
        )

        self.scaler = torch.amp.GradScaler(
            "cuda",
            enabled=self.use_amp,
        )

        # Best validation loss
        self.best_val_loss = float("inf")

        # Early stopping state
        self.early_stopping_counter = 0

        # Training history
        self.history = {
            "epoch": [],
            "train_loss": [],
            "validation_loss": [],
            "learning_rate": [],
        }

        # Checkpoint directory
        self.checkpoint_dir = (
            training_cfg.checkpoint_dir
        )

        self.checkpoint_dir.mkdir(
            parents=True,
            exist_ok=True,
        )

        self.history_path = (
            self.checkpoint_dir
            / "training_history.json"
        )

    def train_epoch(
        self,
        dataloader: DataLoader,
    ) -> Dict[str, float]:
        """
        Train the model for one epoch.

        Supports gradient accumulation to reduce GPU
        memory usage while maintaining a larger effective
        batch size.
        """

        self.model.train()

        total_loss = 0.0
        total_batches = 0

        # Number of batches whose gradients are
        # accumulated before an optimizer update.
        accumulation_steps = (
            self.config.training
            .gradient_accumulation_steps
        )

        accumulation_steps = max(
            accumulation_steps,
            1,
        )

        num_batches = len(dataloader)

        # Clear gradients once at the beginning.
        self.optimizer.zero_grad(
            set_to_none=True
        )

        for batch_idx, batch in enumerate(
            dataloader
        ):

            # ----------------------------------------
            # Move batch data to device
            # ----------------------------------------

            text_ids = (
                batch["text_padded"]
                .to(
                    self.device,
                    non_blocking=True,
                )
            )

            text_lengths = (
                batch["text_lengths"]
                .to(
                    self.device,
                    non_blocking=True,
                )
            )

            language_ids = (
                batch["language_ids"]
                .to(
                    self.device,
                    non_blocking=True,
                )
            )

            target_mel = (
                batch["mel_padded"]
                .to(
                    self.device,
                    non_blocking=True,
                )
            )

            mel_lengths = (
                batch["mel_lengths"]
                .to(
                    self.device,
                    non_blocking=True,
                )
            )

            # ----------------------------------------
            # Determine accumulation group size
            # ----------------------------------------
            #
            # Example:
            #
            # accumulation_steps = 4
            # total batches = 10
            #
            # Groups:
            # 1-4
            # 5-8
            # 9-10
            #
            # The final group contains only 2 batches,
            # so its loss must be divided by 2.
            # ----------------------------------------

            current_group_start = (
                batch_idx
                - (batch_idx % accumulation_steps)
            )

            current_accumulation_steps = min(
                accumulation_steps,
                num_batches - current_group_start,
            )

            # ----------------------------------------
            # Forward pass
            # ----------------------------------------

            with torch.amp.autocast(
                device_type=self.device.type,
                enabled=self.use_amp,
            ):

                coarse_mel, refined_mel = (
                    self.model(
                        text_ids=text_ids,
                        text_lengths=text_lengths,
                        language_ids=language_ids,
                        mel_lengths=mel_lengths,
                    )
                )

                loss, _ = self.criterion(
                    coarse_mel=coarse_mel,
                    refined_mel=refined_mel,
                    target_mel=target_mel,
                    mel_lengths=mel_lengths,
                )

                # Scale loss for gradient accumulation.
                scaled_loss = (
                    loss
                    / current_accumulation_steps
                )

            # ----------------------------------------
            # Backward pass
            # ----------------------------------------

            self.scaler.scale(
                scaled_loss
            ).backward()

            # Store original, unscaled loss for reporting.
            total_loss += loss.item()
            total_batches += 1

            # ----------------------------------------
            # Optimizer update
            # ----------------------------------------

            should_step = (
                (batch_idx + 1)
                % accumulation_steps == 0
                or
                (batch_idx + 1)
                == num_batches
            )

            if should_step:

                # Unscale gradients before clipping.
                self.scaler.unscale_(
                    self.optimizer
                )

                # Gradient clipping.
                torch.nn.utils.clip_grad_norm_(
                    self.model.parameters(),
                    self.config.training
                    .gradient_clip_norm,
                )

                # Update model parameters.
                self.scaler.step(
                    self.optimizer
                )

                self.scaler.update()

                # Clear gradients for the next
                # accumulation group.
                self.optimizer.zero_grad(
                    set_to_none=True
                )

            # ----------------------------------------
            # Progress logging
            # ----------------------------------------

            if (batch_idx + 1) % 50 == 0:

                print(
                    f"Batch "
                    f"{batch_idx + 1}/"
                    f"{num_batches} "
                    f"| Loss: "
                    f"{loss.item():.6f}"
                )

        # --------------------------------------------
        # Epoch average loss
        # --------------------------------------------

        average_loss = (
            total_loss
            / max(total_batches, 1)
        )

        return {
            "train_loss": average_loss
        }

    @torch.no_grad()
    def validate(
        self,
        dataloader: DataLoader,
    ) -> Dict[str, float]:
        """
        Run validation for one epoch.
        """

        self.model.eval()

        total_loss = 0.0
        total_batches = 0

        for batch in dataloader:

            text_ids = (
                batch["text_padded"]
                .to(
                    self.device,
                    non_blocking=True,
                )
            )

            text_lengths = (
                batch["text_lengths"]
                .to(
                    self.device,
                    non_blocking=True,
                )
            )

            language_ids = (
                batch["language_ids"]
                .to(
                    self.device,
                    non_blocking=True,
                )
            )

            target_mel = (
                batch["mel_padded"]
                .to(
                    self.device,
                    non_blocking=True,
                )
            )

            mel_lengths = (
                batch["mel_lengths"]
                .to(
                    self.device,
                    non_blocking=True,
                )
            )

            with torch.amp.autocast(
                device_type=self.device.type,
                enabled=self.use_amp,
            ):

                coarse_mel, refined_mel = (
                    self.model(
                        text_ids=text_ids,
                        text_lengths=text_lengths,
                        language_ids=language_ids,
                        mel_lengths=mel_lengths,
                    )
                )

                loss, _ = self.criterion(
                    coarse_mel=coarse_mel,
                    refined_mel=refined_mel,
                    target_mel=target_mel,
                    mel_lengths=mel_lengths,
                )

            total_loss += loss.item()
            total_batches += 1

        average_loss = (
            total_loss
            / max(total_batches, 1)
        )

        return {
            "validation_loss": average_loss
        }

    def get_learning_rate(self) -> float:
        """
        Return the current optimizer learning rate.
        """

        return (
            self.optimizer.param_groups[0]["lr"]
        )

    def step_scheduler(
        self,
        validation_loss: float,
    ) -> None:
        """
        Update the learning-rate scheduler using
        validation loss.
        """

        self.scheduler.step(
            validation_loss
        )

    def update_history(
        self,
        epoch: int,
        train_loss: float,
        validation_loss: float,
    ) -> None:
        """
        Add current epoch metrics to training history.
        """

        self.history["epoch"].append(
            int(epoch)
        )

        self.history["train_loss"].append(
            float(train_loss)
        )

        self.history["validation_loss"].append(
            float(validation_loss)
        )

        self.history["learning_rate"].append(
            float(
                self.get_learning_rate()
            )
        )

    def save_history(self) -> None:
        """
        Save training history as JSON.
        """

        with open(
            self.history_path,
            "w",
            encoding="utf-8",
        ) as file:

            json.dump(
                self.history,
                file,
                indent=4,
            )

    def _build_checkpoint(
        self,
        epoch: int,
        train_loss: float,
        validation_loss: float,
    ) -> Dict:
        """
        Build a complete resumable checkpoint.
        """

        checkpoint = {
            # Training position
            "epoch": epoch,

            # Model state
            "model_state_dict": (
                self.model.state_dict()
            ),

            # Optimizer state
            "optimizer_state_dict": (
                self.optimizer.state_dict()
            ),

            # Scheduler state
            "scheduler_state_dict": (
                self.scheduler.state_dict()
            ),

            # AMP scaler state
            "scaler_state_dict": (
                self.scaler.state_dict()
            ),

            # Current metrics
            "train_loss": float(
                train_loss
            ),

            "validation_loss": float(
                validation_loss
            ),

            # Best validation state
            "best_val_loss": float(
                self.best_val_loss
            ),

            # Early stopping state
            "early_stopping_counter": int(
                self.early_stopping_counter
            ),

            # Full training history
            "history": self.history,

            # Metadata
            "metadata": {
                "device": str(
                    self.device
                ),
                "use_amp": bool(
                    self.use_amp
                ),
                "learning_rate": float(
                    self.get_learning_rate()
                ),
                "gradient_accumulation_steps": int(
                    self.config.training
                    .gradient_accumulation_steps
                ),
            },

            # Configuration
            "config": self.config,
        }

        return checkpoint

    def save_checkpoint(
        self,
        epoch: int,
        train_loss: float,
        validation_loss: float,
        is_best: bool = False,
    ) -> None:
        """
        Save:
        - Epoch checkpoint
        - Latest resumable checkpoint
        - Best model when validation improves
        - Training history
        """

        checkpoint = (
            self._build_checkpoint(
                epoch=epoch,
                train_loss=train_loss,
                validation_loss=validation_loss,
            )
        )

        # Save epoch-specific checkpoint
        epoch_path = (
            self.checkpoint_dir
            / f"epoch_{epoch:03d}.pt"
        )

        torch.save(
            checkpoint,
            epoch_path,
        )

        # Always save latest checkpoint
        latest_path = (
            self.checkpoint_dir
            / "latest_checkpoint.pt"
        )

        torch.save(
            checkpoint,
            latest_path,
        )

        # Save training history separately
        self.save_history()

        print(
            f"Checkpoint saved: "
            f"{epoch_path}"
        )

        print(
            f"Latest checkpoint updated: "
            f"{latest_path}"
        )

        # Save best model
        if is_best:

            best_path = (
                self.checkpoint_dir
                / "best_model.pt"
            )

            torch.save(
                checkpoint,
                best_path,
            )

            print(
                f"Best model saved: "
                f"{best_path}"
            )

    def load_checkpoint(
        self,
        checkpoint_path: Optional[
            Path
        ] = None,
    ) -> int:
        """
        Load a checkpoint and restore the complete
        training state.

        Returns:
            The next epoch number to train.
        """

        if checkpoint_path is None:

            checkpoint_path = (
                self.checkpoint_dir
                / "latest_checkpoint.pt"
            )

        checkpoint_path = Path(
            checkpoint_path
        )

        if not checkpoint_path.exists():

            print(
                "No checkpoint found. "
                "Starting training from scratch."
            )

            return 1

        print(
            f"Loading checkpoint: "
            f"{checkpoint_path}"
        )

        checkpoint = torch.load(
            checkpoint_path,
            map_location=self.device,
            weights_only=False,
        )

        # Restore model
        self.model.load_state_dict(
            checkpoint["model_state_dict"]
        )

        # Restore optimizer
        if (
            "optimizer_state_dict"
            in checkpoint
        ):

            self.optimizer.load_state_dict(
                checkpoint[
                    "optimizer_state_dict"
                ]
            )

        # Restore scheduler
        if (
            "scheduler_state_dict"
            in checkpoint
        ):

            self.scheduler.load_state_dict(
                checkpoint[
                    "scheduler_state_dict"
                ]
            )

        # Restore AMP scaler
        if (
            "scaler_state_dict"
            in checkpoint
        ):

            self.scaler.load_state_dict(
                checkpoint[
                    "scaler_state_dict"
                ]
            )

        # Restore best validation loss
        self.best_val_loss = (
            checkpoint.get(
                "best_val_loss",
                checkpoint.get(
                    "validation_loss",
                    float("inf"),
                ),
            )
        )

        # Restore early stopping state
        self.early_stopping_counter = (
            checkpoint.get(
                "early_stopping_counter",
                0,
            )
        )

        # Restore training history
        history = checkpoint.get(
            "history",
            None,
        )

        if history is not None:

            self.history = history

        # Last completed epoch
        last_epoch = checkpoint.get(
            "epoch",
            0,
        )

        next_epoch = (
            last_epoch + 1
        )

        print(
            "Checkpoint restored successfully."
        )

        print(
            f"Last completed epoch: "
            f"{last_epoch}"
        )

        print(
            f"Resuming from epoch: "
            f"{next_epoch}"
        )

        print(
            f"Best validation loss: "
            f"{self.best_val_loss:.6f}"
        )

        return next_epoch

    def update_early_stopping(
        self,
        validation_loss: float,
        patience: int,
        min_delta: float = 0.0,
    ) -> Tuple[bool, bool]:
        """
        Update best validation loss and early stopping.

        Returns:
            is_best:
                True if validation loss improved.

            should_stop:
                True if early stopping patience
                has been reached.
        """

        is_best = False
        should_stop = False

        if (
            validation_loss
            < self.best_val_loss - min_delta
        ):

            self.best_val_loss = (
                validation_loss
            )

            self.early_stopping_counter = 0

            is_best = True

            print(
                "Validation loss improved."
            )

        else:

            self.early_stopping_counter += 1

            print(
                "Validation loss did not improve. "
                f"Early stopping counter: "
                f"{self.early_stopping_counter}/"
                f"{patience}"
            )

            if (
                self.early_stopping_counter
                >= patience
            ):

                should_stop = True

        return is_best, should_stop