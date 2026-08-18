/**
 * Purpose: Central Game Registry — Single source of truth for all games in the application.
 * Module: Config
 * Folder: frontend/src/config
 */

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
  supportedLanguages: ('en' | 'hi' | 'mr')[];
}

export const GAME_REGISTRY: readonly GameRegistryEntry[] = [
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
  },
] as const;
