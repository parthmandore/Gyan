import { NavigatorScreenParams } from '@react-navigation/native';
import { GamesStackParamList } from '../navigation/GamesNavigator';

export interface AppState {
  language: string;
  isInitialized: boolean;
  setLanguage: (lang: string) => void;
  setInitialized: (val: boolean) => void;
}

export type RootStackParamList = {
  LanguageGate: undefined;
  GameCatalog: undefined;
  Home: undefined;
  SpeechSynthesis: undefined;
  Games: NavigatorScreenParams<GamesStackParamList>;
};
