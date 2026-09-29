/**
 * Purpose: Provider component wrapping app tree to supply global language state and persistence hooks.
 * Module: Language Architecture
 * Folder: frontend/src/language
 */

import React, { useEffect, useState, useContext, useCallback } from 'react';
import { LanguageContext } from './LanguageContext';
import { LanguageManager } from './LanguageManager';
import { LearningLanguage } from './types';

export interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [learningLanguage, setLearningLanguageState] = useState<LearningLanguage>('english');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    LanguageManager.init().then((lang) => {
      if (isMounted) {
        setLearningLanguageState(lang);
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const setLearningLanguage = useCallback(async (lang: LearningLanguage) => {
    setLearningLanguageState(lang);
    await LanguageManager.setLanguage(lang);
  }, []);

  return (
    <LanguageContext.Provider value={{ learningLanguage, setLearningLanguage, isLoading }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLearningLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLearningLanguage must be used within a LanguageProvider');
  }
  return context;
};
