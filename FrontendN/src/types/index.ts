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
  RoleSelection: undefined;
  Home: undefined;
  GameCatalog: undefined;
  SpeechSynthesis: undefined;
  ParentDashboard: undefined;
  TeacherDashboard: undefined;
  Games: NavigatorScreenParams<GamesStackParamList>;
};