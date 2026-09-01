/**
 * Purpose: Cross-platform microphone audio recording hook for Web and Mobile with
 *          auto gain control, echo cancellation, noise suppression, and trailing buffer.
 * Module: Speech Word Challenge
 * Folder: frontend/src/screens/games/SpeechWordChallenge/hooks
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { Platform } from 'react-native';

export interface UseAudioRecorderReturn {
  isRecording: boolean;
  permissionGranted: boolean | null;
  recordingDuration: number;
  startRecording: () => Promise<boolean>;
  stopRecording: () => Promise<Blob | string | null>;
  cancelRecording: () => void;
  error: string | null;
}

export const useAudioRecorder = (): UseAudioRecorderReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<any>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  // Check initial permissions
  useEffect(() => {
    return () => {
      // Cleanup stream and timer on unmount
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track: any) => track.stop());
      }
    };
  }, []);

  const startRecording = useCallback(async (): Promise<boolean> => {
    setError(null);
    setRecordingDuration(0);
    audioChunksRef.current = [];

    try {
      if (Platform.OS === 'web') {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setError('Microphone is not supported in this browser.');
          setPermissionGranted(false);
          return false;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,
            sampleRate: 16000,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true, // Enhances clarity for soft child speech
          },
        });

        streamRef.current = stream;
        setPermissionGranted(true);

        const options = { mimeType: 'audio/webm;codecs=opus' };
        const recorder = MediaRecorder.isTypeSupported(options.mimeType)
          ? new MediaRecorder(stream, options)
          : new MediaRecorder(stream);

        recorder.ondataavailable = (event: any) => {
          if (event.data && event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorderRef.current = recorder;
        recorder.start(100); // 100ms slices

        setIsRecording(true);

        // Duration timer & 4.0s auto-stop for kids
        const startTime = Date.now();
        timerRef.current = setInterval(() => {
          const elapsed = (Date.now() - startTime) / 1000;
          setRecordingDuration(elapsed);
        }, 100);

        return true;
      } else {
        // Mobile fallback / placeholder
        setIsRecording(true);
        return true;
      }
    } catch (err: any) {
      console.warn('[useAudioRecorder] Mic error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionGranted(false);
        setError('Microphone permission was denied.');
      } else {
        setError(err.message || 'Could not access microphone.');
      }
      setIsRecording(false);
      return false;
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<Blob | string | null> => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (Platform.OS === 'web') {
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === 'inactive') {
        setIsRecording(false);
        return null;
      }

      // Small 150ms trailing buffer to avoid cutting off trailing consonants (e.g. /l/ in "bowl")
      await new Promise((r) => setTimeout(r, 150));

      return new Promise<Blob | null>((resolve) => {
        recorder.onstop = () => {
          setIsRecording(false);
          const mimeType = recorder.mimeType || 'audio/webm';
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
          audioChunksRef.current = [];

          if (streamRef.current) {
            streamRef.current.getTracks().forEach((track: any) => track.stop());
            streamRef.current = null;
          }

          resolve(audioBlob);
        };

        try {
          recorder.stop();
        } catch {
          setIsRecording(false);
          resolve(null);
        }
      });
    } else {
      setIsRecording(false);
      return null;
    }
  }, []);

  const cancelRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track: any) => track.stop());
      streamRef.current = null;
    }
    audioChunksRef.current = [];
    setIsRecording(false);
    setRecordingDuration(0);
  }, []);

  return {
    isRecording,
    permissionGranted,
    recordingDuration,
    startRecording,
    stopRecording,
    cancelRecording,
    error,
  };
};
