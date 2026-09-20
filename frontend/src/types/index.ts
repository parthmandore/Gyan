import { NavigatorScreenParams } from '@react-navigation/native';
import { GamesStackParamList } from '../navigation/GamesNavigator';

export interface AppState {
  language: string;
  isInitialized: boolean;
  setLanguage: (lang: string) => void;
  setInitialized: (val: boolean) => void;
}

export type RootStackParamList = {
  LanguageGate: { initialStep?: 'motherTongue' | 'learningLanguage' | 'age' } | undefined;
  GameCatalog: undefined;
  Home: undefined;
  Games: NavigatorScreenParams<GamesStackParamList>;
};
