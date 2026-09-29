/**
 * Purpose: Nested games navigator for registering individual game screen modules.
 * Module: Navigation
 * Folder: FrontendN/src/navigation
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AlphabetMatchingStackParamList } from '../screens/games/AlphabetMatching/types';
import { CapitalSmallMatchStackParamList } from '../screens/games/CapitalSmallMatch/types';
import { VowelMatraMatchStackParamList } from '../screens/games/VowelMatraMatch/types';
import { SpeechWordChallengeStackParamList } from '../screens/games/SpeechWordChallenge/types';
import { LanguagePairMatchStackParamList } from '../screens/games/LanguagePairMatch/types';
import { ColourChallengeStackParamList } from '../screens/games/ColourChallenge/types';
import { ShapeChallengeStackParamList } from '../screens/games/ShapeChallenge/types';
import { LetterTracingStackParamList } from '../screens/games/LetterTracing/types';
import { MathChallengeStackParamList } from '../screens/games/MathChallenge/types';
import { AptitudeChallengeStackParamList } from '../screens/games/AptitudeChallenge/types';
import { GrammarChallengeStackParamList } from '../screens/games/GrammarChallenge/types';
import { MissingLettersStackParamList } from '../screens/games/MissingLetters/types';
import { MissingNumbersStackParamList } from '../screens/games/MissingNumbers/types';
import { NumberCountingStackParamList } from '../screens/games/NumberCounting/types';
import { PutInOrderStackParamList } from '../screens/games/PutInOrder/types';
import { GuessTheShapeStackParamList } from '../screens/games/GuessTheShape/types';
import { MissingLetterWordsStackParamList } from '../screens/games/MissingLetterWords';
import { FindTheCorrectWordStackParamList } from '../screens/games/FindTheCorrectWord';
import { OddWordOutStackParamList } from '../screens/games/OddWordOut';

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

import {
  IntroScreen as LanguagePairMatchIntroScreen,
  GameScreen as LanguagePairMatchGameScreen,
  SessionCompleteScreen as LanguagePairMatchSessionCompleteScreen,
} from '../screens/games/LanguagePairMatch';

import {
  IntroScreen as ColourChallengeIntroScreen,
  GameScreen as ColourChallengeGameScreen,
  SessionCompleteScreen as ColourChallengeSessionCompleteScreen,
} from '../screens/games/ColourChallenge';

import {
  IntroScreen as ShapeChallengeIntroScreen,
  GameScreen as ShapeChallengeGameScreen,
  SessionCompleteScreen as ShapeChallengeSessionCompleteScreen,
} from '../screens/games/ShapeChallenge';

import {
  IntroScreen as LetterTracingIntroScreen,
  GameScreen as LetterTracingGameScreen,
  SessionCompleteScreen as LetterTracingSessionCompleteScreen,
} from '../screens/games/LetterTracing';

import {
  IntroScreen as MathChallengeIntroScreen,
  GameScreen as MathChallengeGameScreen,
  SessionCompleteScreen as MathChallengeSessionCompleteScreen,
} from '../screens/games/MathChallenge';

import {
  IntroScreen as AptitudeChallengeIntroScreen,
  GameScreen as AptitudeChallengeGameScreen,
  SessionCompleteScreen as AptitudeChallengeSessionCompleteScreen,
} from '../screens/games/AptitudeChallenge';

import {
  IntroScreen as GrammarChallengeIntroScreen,
  GameScreen as GrammarChallengeGameScreen,
  SessionCompleteScreen as GrammarChallengeSessionCompleteScreen,
} from '../screens/games/GrammarChallenge';

import {
  IntroScreen as MissingLettersIntroScreen,
  GameScreen as MissingLettersGameScreen,
  SessionCompleteScreen as MissingLettersSessionCompleteScreen,
} from '../screens/games/MissingLetters';

import {
  IntroScreen as MissingNumbersIntroScreen,
  GameScreen as MissingNumbersGameScreen,
  SessionCompleteScreen as MissingNumbersSessionCompleteScreen,
} from '../screens/games/MissingNumbers';

import {
  IntroScreen as NumberCountingIntroScreen,
  GameScreen as NumberCountingGameScreen,
  SessionCompleteScreen as NumberCountingSessionCompleteScreen,
} from '../screens/games/NumberCounting';

import {
  IntroScreen as PutInOrderIntroScreen,
  GameScreen as PutInOrderGameScreen,
  SessionCompleteScreen as PutInOrderSessionCompleteScreen,
} from '../screens/games/PutInOrder';

import {
  IntroScreen as GuessTheShapeIntroScreen,
  GameScreen as GuessTheShapeGameScreen,
  SessionCompleteScreen as GuessTheShapeSessionCompleteScreen,
} from '../screens/games/GuessTheShape';

import {
  MissingLetterWordsIntro as MissingLetterWordsIntroScreen,
  MissingLetterWordsGame as MissingLetterWordsGameScreen,
  MissingLetterWordsSessionComplete as MissingLetterWordsSessionCompleteScreen,
} from '../screens/games/MissingLetterWords';

import {
  FindTheCorrectWordIntro as FindTheCorrectWordIntroScreen,
  FindTheCorrectWordGame as FindTheCorrectWordGameScreen,
  FindTheCorrectWordSessionComplete as FindTheCorrectWordSessionCompleteScreen,
} from '../screens/games/FindTheCorrectWord';

import {
  OddWordOutIntro as OddWordOutIntroScreen,
  OddWordOutGame as OddWordOutGameScreen,
  OddWordOutSessionComplete as OddWordOutSessionCompleteScreen,
} from '../screens/games/OddWordOut';

import { GameCatalogScreen } from '../screens/GameCatalogScreen';

export type GamesCatalogStackParamList = {
  GameCatalog: undefined;
  GamesCatalog: undefined;
};

export type GamesStackParamList =
  AlphabetMatchingStackParamList &
  CapitalSmallMatchStackParamList &
  VowelMatraMatchStackParamList &
  SpeechWordChallengeStackParamList &
  LanguagePairMatchStackParamList &
  ColourChallengeStackParamList &
  ShapeChallengeStackParamList &
  LetterTracingStackParamList &
  MathChallengeStackParamList &
  AptitudeChallengeStackParamList &
  GrammarChallengeStackParamList &
  MissingLettersStackParamList &
  MissingNumbersStackParamList &
  NumberCountingStackParamList &
  PutInOrderStackParamList &
  GuessTheShapeStackParamList &
  MissingLetterWordsStackParamList &
  FindTheCorrectWordStackParamList &
  OddWordOutStackParamList &
  GamesCatalogStackParamList;

const Stack = createNativeStackNavigator<GamesStackParamList>();

export const GamesNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="AlphabetMatchingModeSelection"
      screenOptions={{ headerShown: false }}
    >
      {/* Alphabet Matching */}
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

      {/* Capital & Small Letter Match */}
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

      {/* Vowel & Matra Match */}
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

      {/* Speech Word Challenge */}
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

      {/* Language Pair Match */}
      <Stack.Screen
        name="LanguagePairMatchIntro"
        component={LanguagePairMatchIntroScreen}
      />
      <Stack.Screen
        name="LanguagePairMatchGame"
        component={LanguagePairMatchGameScreen}
      />
      <Stack.Screen
        name="LanguagePairMatchSessionComplete"
        component={LanguagePairMatchSessionCompleteScreen}
      />

      {/* Colour Challenge */}
      <Stack.Screen
        name="ColourChallengeIntro"
        component={ColourChallengeIntroScreen}
      />
      <Stack.Screen
        name="ColourChallengeGame"
        component={ColourChallengeGameScreen}
      />
      <Stack.Screen
        name="ColourChallengeSessionComplete"
        component={ColourChallengeSessionCompleteScreen}
      />

      {/* Shape Challenge */}
      <Stack.Screen
        name="ShapeChallengeIntro"
        component={ShapeChallengeIntroScreen}
      />
      <Stack.Screen
        name="ShapeChallengeGame"
        component={ShapeChallengeGameScreen}
      />
      <Stack.Screen
        name="ShapeChallengeSessionComplete"
        component={ShapeChallengeSessionCompleteScreen}
      />

      {/* Letter Tracing */}
      <Stack.Screen
        name="LetterTracingIntro"
        component={LetterTracingIntroScreen}
      />
      <Stack.Screen
        name="LetterTracingGame"
        component={LetterTracingGameScreen}
      />
      <Stack.Screen
        name="LetterTracingSessionComplete"
        component={LetterTracingSessionCompleteScreen}
      />

      {/* Mathematics */}
      <Stack.Screen
        name="MathChallengeIntro"
        component={MathChallengeIntroScreen}
      />
      <Stack.Screen
        name="MathChallengeGame"
        component={MathChallengeGameScreen}
      />
      <Stack.Screen
        name="MathChallengeSessionComplete"
        component={MathChallengeSessionCompleteScreen}
      />

      {/* Aptitude */}
      <Stack.Screen
        name="AptitudeChallengeIntro"
        component={AptitudeChallengeIntroScreen}
      />
      <Stack.Screen
        name="AptitudeChallengeGame"
        component={AptitudeChallengeGameScreen}
      />
      <Stack.Screen
        name="AptitudeChallengeSessionComplete"
        component={AptitudeChallengeSessionCompleteScreen}
      />

      {/* Grammar */}
      <Stack.Screen
        name="GrammarChallengeIntro"
        component={GrammarChallengeIntroScreen}
      />
      <Stack.Screen
        name="GrammarChallengeGame"
        component={GrammarChallengeGameScreen}
      />
      <Stack.Screen
        name="GrammarChallengeSessionComplete"
        component={GrammarChallengeSessionCompleteScreen}
      />

      {/* Missing Letters */}
      <Stack.Screen
        name="MissingLettersIntro"
        component={MissingLettersIntroScreen}
      />
      <Stack.Screen
        name="MissingLettersGame"
        component={MissingLettersGameScreen}
      />
      <Stack.Screen
        name="MissingLettersSessionComplete"
        component={MissingLettersSessionCompleteScreen}
      />

      {/* Missing Numbers */}
      <Stack.Screen
        name="MissingNumbersIntro"
        component={MissingNumbersIntroScreen}
      />
      <Stack.Screen
        name="MissingNumbersGame"
        component={MissingNumbersGameScreen}
      />
      <Stack.Screen
        name="MissingNumbersSessionComplete"
        component={MissingNumbersSessionCompleteScreen}
      />

      {/* Number Counting */}
      <Stack.Screen
        name="NumberCountingIntro"
        component={NumberCountingIntroScreen}
      />
      <Stack.Screen
        name="NumberCountingGame"
        component={NumberCountingGameScreen}
      />
      <Stack.Screen
        name="NumberCountingSessionComplete"
        component={NumberCountingSessionCompleteScreen}
      />

      {/* Put In Order */}
      <Stack.Screen
        name="PutInOrderIntro"
        component={PutInOrderIntroScreen}
      />
      <Stack.Screen
        name="PutInOrderGame"
        component={PutInOrderGameScreen}
      />
      <Stack.Screen
        name="PutInOrderSessionComplete"
        component={PutInOrderSessionCompleteScreen}
      />

      {/* Guess The Shape */}
      <Stack.Screen
        name="GuessTheShapeIntro"
        component={GuessTheShapeIntroScreen}
      />
      <Stack.Screen
        name="GuessTheShapeGame"
        component={GuessTheShapeGameScreen}
      />
      <Stack.Screen
        name="GuessTheShapeSessionComplete"
        component={GuessTheShapeSessionCompleteScreen}
      />

      {/* Missing Letter Words */}
      <Stack.Screen
        name="MissingLetterWordsIntro"
        component={MissingLetterWordsIntroScreen}
      />
      <Stack.Screen
        name="MissingLetterWordsGame"
        component={MissingLetterWordsGameScreen}
      />
      <Stack.Screen
        name="MissingLetterWordsSessionComplete"
        component={MissingLetterWordsSessionCompleteScreen}
      />

      {/* Find The Correct Word */}
      <Stack.Screen
        name="FindTheCorrectWordIntro"
        component={FindTheCorrectWordIntroScreen}
      />
      <Stack.Screen
        name="FindTheCorrectWordGame"
        component={FindTheCorrectWordGameScreen}
      />
      <Stack.Screen
        name="FindTheCorrectWordSessionComplete"
        component={FindTheCorrectWordSessionCompleteScreen}
      />

      {/* Odd Word Out */}
      <Stack.Screen
        name="OddWordOutIntro"
        component={OddWordOutIntroScreen}
      />
      <Stack.Screen
        name="OddWordOutGame"
        component={OddWordOutGameScreen}
      />
      <Stack.Screen
        name="OddWordOutSessionComplete"
        component={OddWordOutSessionCompleteScreen}
      />

      {/* Catalog fallback */}
      <Stack.Screen
        name="GameCatalog"
        component={GameCatalogScreen}
      />
      <Stack.Screen
        name="GamesCatalog"
        component={GameCatalogScreen}
      />
    </Stack.Navigator>
  );
};