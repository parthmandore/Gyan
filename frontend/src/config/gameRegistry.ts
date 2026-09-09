/**
 * Purpose: Central Game Registry — Single source of truth for all games in the application.
 *          Contains multilingual and age-based metadata for catalog filtering.
 * Module: Config
 * Folder: frontend/src/config
 */

import { AppLanguage, AppAge } from '../state/appLanguageStore';

export interface GameRegistryEntry {
  id: string;
  titleKey: string;
  descriptionKey: string;
  iconAsset: string;
  bgColor: string;
  gradientColors: readonly [string, string, string];
  bevelColor: string;
  badgeTag: string;
  navigatorRoute: string;
  routeParams?: Record<string, string>;
  supportedLanguages: AppLanguage[];
  minimumAge: AppAge;
  maximumAge: AppAge;
  ageGroups: readonly AppAge[];
}

export const GAME_REGISTRY: readonly GameRegistryEntry[] = [
  // ==========================================
  // AGE 5 GAMES (UNCHANGED)
  // ==========================================
  {
    id: 'alphabet_matching',
    titleKey: 'games.alphabetMatching.title',
    descriptionKey: 'games.alphabetMatching.description',
    iconAsset: '🔤',
    bgColor: '#3B82F6',
    gradientColors: ['#3B82F6', '#2563EB', '#1D4ED8'],
    bevelColor: '#1E40AF',
    badgeTag: 'A - Z',
    navigatorRoute: 'AlphabetMatchingModeSelection',
    supportedLanguages: ['en', 'hi', 'mr'],
    minimumAge: 5,
    maximumAge: 5,
    ageGroups: [5],
  },
  {
    id: 'capital_small_match',
    titleKey: 'games.capitalSmallMatch.title',
    descriptionKey: 'games.capitalSmallMatch.description',
    iconAsset: '🔠',
    bgColor: '#10B981',
    gradientColors: ['#10B981', '#059669', '#047857'],
    bevelColor: '#065F46',
    badgeTag: 'Aa - Zz',
    navigatorRoute: 'CapitalSmallMatchIntro',
    supportedLanguages: ['en'],
    minimumAge: 5,
    maximumAge: 5,
    ageGroups: [5],
  },
  {
    id: 'vowel_matra_match',
    titleKey: 'games.vowelMatraMatch.title',
    descriptionKey: 'games.vowelMatraMatch.description',
    iconAsset: '🕉️',
    bgColor: '#8B5CF6',
    gradientColors: ['#8B5CF6', '#7C3AED', '#6D28D9'],
    bevelColor: '#5B21B6',
    badgeTag: 'अ - क',
    navigatorRoute: 'VowelMatraMatchIntro',
    supportedLanguages: ['hi', 'mr'],
    minimumAge: 5,
    maximumAge: 5,
    ageGroups: [5],
  },
  {
    id: 'speech_letters',
    titleKey: 'games.speechLetters.title',
    descriptionKey: 'games.speechLetters.description',
    iconAsset: '🔤',
    bgColor: '#EC4899',
    gradientColors: ['#EC4899', '#DB2777', '#BE185D'],
    bevelColor: '#9D174D',
    badgeTag: '🔤 Letters',
    navigatorRoute: 'SpeechWordChallengeIntro',
    routeParams: { category: 'letters' },
    supportedLanguages: ['en', 'hi', 'mr'],
    minimumAge: 5,
    maximumAge: 5,
    ageGroups: [5],
  },

  // ==========================================
  // AGE 6 GAMES (VOCABULARY CATEGORIES)
  // ==========================================
  {
    id: 'speech_animals',
    titleKey: 'games.speechAnimals.title',
    descriptionKey: 'games.speechAnimals.description',
    iconAsset: '🐾',
    bgColor: '#F59E0B',
    gradientColors: ['#F59E0B', '#D97706', '#B45309'],
    bevelColor: '#92400E',
    badgeTag: '🐾 Animals',
    navigatorRoute: 'SpeechWordChallengeIntro',
    routeParams: { category: 'animals' },
    supportedLanguages: ['en', 'hi', 'mr'],
    minimumAge: 6,
    maximumAge: 6,
    ageGroups: [6],
  },
  {
    id: 'speech_fruits_vegetables',
    titleKey: 'games.speechFruits.title',
    descriptionKey: 'games.speechFruits.description',
    iconAsset: '🍎',
    bgColor: '#10B981',
    gradientColors: ['#10B981', '#059669', '#047857'],
    bevelColor: '#065F46',
    badgeTag: '🍎 Fruits & Veg',
    navigatorRoute: 'SpeechWordChallengeIntro',
    routeParams: { category: 'fruits' },
    supportedLanguages: ['en', 'hi', 'mr'],
    minimumAge: 6,
    maximumAge: 6,
    ageGroups: [6],
  },
  {
    id: 'speech_everyday_nature',
    titleKey: 'games.speechEveryday.title',
    descriptionKey: 'games.speechEveryday.description',
    iconAsset: '🌳',
    bgColor: '#6366F1',
    gradientColors: ['#6366F1', '#4F46E5', '#4338CA'],
    bevelColor: '#3730A3',
    badgeTag: '🌳 Nature',
    navigatorRoute: 'SpeechWordChallengeIntro',
    routeParams: { category: 'nature' },
    supportedLanguages: ['en', 'hi', 'mr'],
    minimumAge: 6,
    maximumAge: 6,
    ageGroups: [6],
  },
  {
    id: 'language_pair_match',
    titleKey: 'games.languagePairMatch.title',
    descriptionKey: 'games.languagePairMatch.description',
    iconAsset: '🧩',
    bgColor: '#EC4899',
    gradientColors: ['#EC4899', '#DB2777', '#BE185D'],
    bevelColor: '#9D174D',
    badgeTag: '🧩 Word Match',
    navigatorRoute: 'LanguagePairMatchIntro',
    supportedLanguages: ['en', 'hi', 'mr'],
    minimumAge: 6,
    maximumAge: 6,
    ageGroups: [6],
  },
] as const;
