/**
 * Purpose: Type definitions for the Basic Grammar games suite.
 *          Supports Noun or Verb, Singular or Plural, Complete the Sentence,
 *          Articles/Determiners, Pronouns, Prepositions, Basic Tenses, and Sentence Correction.
 * Module: Grammar Challenge — Types
 * Folder: frontend/src/screens/games/GrammarChallenge
 */

export type GrammarTopic =
  | 'noun_or_verb'
  | 'singular_or_plural'
  | 'complete_the_sentence'
  | 'articles_determiners'
  | 'pronouns'
  | 'prepositions'
  | 'basic_tenses'
  | 'sentence_correction';

export interface GrammarOption {
  id: string;
  label: string;
  isCorrect: boolean;
}

export interface GrammarQuestionItem {
  id: string;
  topic: GrammarTopic;
  age: 6 | 7;
  promptKey?: string;
  promptFallback?: string;
  sentence: string;      // The stimulus sentence (e.g. "The cat ___ running." or "Dog")
  highlightWord?: string; // Optional word to highlight or inspect
  visualIcon?: string;   // Optional child-friendly emoji/icon
  options: { label: string; isCorrect: boolean }[];
  explanation?: string;
}

export interface GrammarQuestion {
  id: string;
  topic: GrammarTopic;
  roundNumber: number; // 1 to 5
  sentence: string;
  highlightWord?: string;
  visualIcon?: string;
  options: GrammarOption[];
  promptKey: string;
  promptFallback: string;
  explanation?: string;
}

export interface GrammarRound {
  roundNumber: number; // 1 to 5
  question: GrammarQuestion;
}

export interface GrammarAttempt {
  roundNumber: number;
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
  attemptCount: number;
  timestamp: number;
}

export type GrammarChallengeStackParamList = {
  GrammarChallengeIntro: { topic?: GrammarTopic } | undefined;
  GrammarChallengeGame: { topic: GrammarTopic };
  GrammarChallengeSessionComplete: {
    topic: GrammarTopic;
    starsEarned: number;
    xpEarned: number;
    itemsCorrect: number;
    sessionLength: number;
    accuracy: number;
    isTimeExpired?: boolean;
  };
};
