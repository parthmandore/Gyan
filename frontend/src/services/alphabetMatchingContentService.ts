/**
 * Purpose: Service layer for fetching Alphabet Matching content (rounds, target items, options)
 *          consuming active datasets (capital letters, small letters, numbers).
 * Module: Services
 * Folder: frontend/src/services
 */

import { apiClient } from './apiClient';
import { GameMode } from '../screens/games/AlphabetMatching/types';
import { getDataset } from '../screens/games/AlphabetMatching/datasets';
import {
  getGridSizeForDifficulty,
  shouldIncludeConfusablePairs,
} from '../screens/games/AlphabetMatching/utils/difficultyConfig';
import { useAppLanguageStore } from '../state/appLanguageStore';
import { getAlphabetConfig } from '../config/languageAlphabets';

export interface RoundContent {
  round_id: number;
  target_letter: string;
  options: string[];
  audio_prompt_key: string;
  audio_url?: string | null;
}

export interface GameContentData {
  game_type: string;
  difficulty: number;
  mode: GameMode;
  rounds: RoundContent[];
}

export interface GameContentResponse {
  success: boolean;
  data: GameContentData;
}

export const ensureTargetInOptions = (targetLetter: string, options: string[]): string[] => {
  const upperTarget = targetLetter.toUpperCase();
  const hasTarget = options.some((opt) => opt.toUpperCase() === upperTarget);
  if (hasTarget) {
    return options;
  }
  const updated = [...options];
  updated[updated.length - 1] = targetLetter;
  return updated;
};

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const generateDynamicMockContent = (
  difficulty: number,
  mode: GameMode = 'capital'
): GameContentData => {
  const selectedLang = useAppLanguageStore.getState().selectedLanguage || 'en';
  const alphabetConfig = getAlphabetConfig(selectedLang);

  const targetCount = getGridSizeForDifficulty(difficulty);
  const includeConfusable = shouldIncludeConfusablePairs(difficulty);
  const activeDataset = getDataset(mode);

  const symbolsPool = activeDataset.symbols || alphabetConfig.capitalLetters;
  const confusableMap = activeDataset.confusableMap || alphabetConfig.confusableMap || {};

  const shuffledPool = shuffleArray(symbolsPool);
  const selectedTargets = shuffledPool.slice(0, Math.min(10, shuffledPool.length));

  const rounds: RoundContent[] = selectedTargets.map((target, index) => {
    const optionsSet = new Set<string>([target]);
    const confusablePartner = confusableMap[target];

    if (includeConfusable && confusablePartner && symbolsPool.includes(confusablePartner) && targetCount > optionsSet.size) {
      optionsSet.add(confusablePartner);
    }

    let candidatePool = symbolsPool.filter((l) => l !== target);
    if (!includeConfusable && confusablePartner) {
      candidatePool = candidatePool.filter((l) => l !== confusablePartner);
    }

    const shuffledCandidates = shuffleArray(candidatePool);
    for (const cand of shuffledCandidates) {
      if (optionsSet.size >= targetCount) break;
      optionsSet.add(cand);
    }

    const finalOptions = shuffleArray(Array.from(optionsSet));
    const validatedOptions = ensureTargetInOptions(target, finalOptions);

    return {
      round_id: index + 1,
      target_letter: target,
      options: validatedOptions,
      audio_prompt_key: `prompt_match_${target.toLowerCase()}`,
    };
  });

  return {
    game_type: 'alphabet_matching',
    difficulty,
    mode,
    rounds,
  };
};

export const fetchAlphabetMatchingContent = async (
  difficulty: number = 1,
  mode: GameMode = 'capital'
): Promise<GameContentResponse> => {
  const selectedLang = useAppLanguageStore.getState().selectedLanguage || 'en';
  try {
    const response = await apiClient.get<GameContentResponse>(
      `/api/games/alphabet_matching/content?difficulty=${difficulty}&mode=${mode}&lang=${selectedLang}`
    );
    const validatedData = {
      ...response.data,
      data: {
        ...response.data.data,
        rounds: response.data.data.rounds.map((r) => ({
          ...r,
          options: ensureTargetInOptions(r.target_letter, r.options),
        })),
      },
    };
    return validatedData;
  } catch (error) {
    console.warn('[alphabetMatchingContentService] Backend API offline. Generating dynamic temporary mock content.');
    const content = generateDynamicMockContent(difficulty, mode);

    return {
      success: true,
      data: content,
    };
  }
};
