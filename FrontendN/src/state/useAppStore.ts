import { create } from 'zustand';
import { AppState } from '../types';

export const useAppStore = create<AppState>((set) => ({
  language: 'en',
  isInitialized: true,
  setLanguage: (language: string) => set({ language }),
  setInitialized: (isInitialized: boolean) => set({ isInitialized }),
}));
