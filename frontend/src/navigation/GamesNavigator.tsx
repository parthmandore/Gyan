/**
 * Purpose: Nested games navigator for registering individual game screen modules.
 * Module: Navigation
 * Folder: frontend/src/navigation
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AlphabetMatchingStackParamList } from '../screens/games/AlphabetMatching/types';
import { CapitalSmallMatchStackParamList } from '../screens/games/CapitalSmallMatch/types';
import { VowelMatraMatchStackParamList } from '../screens/games/VowelMatraMatch/types';
import { SpeechWordChallengeStackParamList } from '../screens/games/SpeechWordChallenge/types';
import {
  ModeSelectionScreen as AlphabetMatchingModeSelectionScreen,
  GameScreen as AlphabetMatchingGameScreen,
  SessionCompleteScreen as AlphabetMatchingSessionCompleteScreen,
} from '../screens/games/AlphabetMatching';
import {
  IntroScreen as CapitalSmallMatchIntroScreen,
  GameScreen as CapitalSmallMatchGameScreen,
  SessionCompleteScreen as CapitalSmallMatchSessionCompleteScreen,
} from '../screens/games/CapitalSmallMatch';
import {
  IntroScreen as VowelMatraMatchIntroScreen,
  GameScreen as VowelMatraMatchGameScreen,
  SessionCompleteScreen as VowelMatraMatchSessionCompleteScreen,
} from '../screens/games/VowelMatraMatch';
import {
  IntroScreen as SpeechWordChallengeIntroScreen,
  GameScreen as SpeechWordChallengeGameScreen,
  SessionCompleteScreen as SpeechWordChallengeSessionCompleteScreen,
} from '../screens/games/SpeechWordChallenge';

export type GamesStackParamList = AlphabetMatchingStackParamList &
  CapitalSmallMatchStackParamList &
  VowelMatraMatchStackParamList &
  SpeechWordChallengeStackParamList;

const Stack = createNativeStackNavigator<GamesStackParamList>();

export const GamesNavigator: React.FC = () => {
  return (
    <Stack.Navigator initialRouteName="AlphabetMatchingModeSelection" screenOptions={{ headerShown: false }}>
      {/* === Alphabet Matching === */}
      <Stack.Screen
        name="AlphabetMatchingModeSelection"
        component={AlphabetMatchingModeSelectionScreen}
      />
      <Stack.Screen
        name="AlphabetMatchingGame"
        component={AlphabetMatchingGameScreen}
      />
      <Stack.Screen
        name="AlphabetMatchingSessionComplete"
        component={AlphabetMatchingSessionCompleteScreen}
      />

      {/* === Capital & Small Letter Match === */}
      <Stack.Screen
        name="CapitalSmallMatchIntro"
        component={CapitalSmallMatchIntroScreen}
      />
      <Stack.Screen
        name="CapitalSmallMatchGame"
        component={CapitalSmallMatchGameScreen}
      />
      <Stack.Screen
        name="CapitalSmallMatchSessionComplete"
        component={CapitalSmallMatchSessionCompleteScreen}
      />

      {/* === Vowel & Matra Match === */}
      <Stack.Screen
        name="VowelMatraMatchIntro"
        component={VowelMatraMatchIntroScreen}
      />
      <Stack.Screen
        name="VowelMatraMatchGame"
        component={VowelMatraMatchGameScreen}
      />
      <Stack.Screen
        name="VowelMatraMatchSessionComplete"
        component={VowelMatraMatchSessionCompleteScreen}
      />

      {/* === Speech Word Challenge === */}
      <Stack.Screen
        name="SpeechWordChallengeIntro"
        component={SpeechWordChallengeIntroScreen}
      />
      <Stack.Screen
        name="SpeechWordChallengeGame"
        component={SpeechWordChallengeGameScreen}
      />
      <Stack.Screen
        name="SpeechWordChallengeSessionComplete"
        component={SpeechWordChallengeSessionCompleteScreen}
      />
    </Stack.Navigator>
  );
};
