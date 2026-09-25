/**
 * Purpose: Root stack navigator managing Language Gate,
 * Role Selection, Login, Student, Parent, Teacher and Games.
 * Module: Navigation
 * Folder: frontend/src/navigation
 */

import React, { useEffect, useState } from 'react';

import {
  View,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { RootStackParamList } from '../types';

import { LanguageGateScreen } from '../screens/LanguageGateScreen';
import { RoleSelectionScreen } from '../screens/RoleSelectionScreen';
import { LoginScreen } from '../screens/LoginScreen';

import { HomeScreen } from '../screens/HomeScreen';
import { GameCatalogScreen } from '../screens/GameCatalogScreen';
import { SpeechSynthesisScreen } from '../screens/SpeechSynthesisScreen';

import ParentDashboardScreen from '../screens/ParentDashboardScreen';
import TeacherDashboardScreen from '../screens/TeacherDashboardScreen';

import { GamesNavigator } from './GamesNavigator';

import { useAppLanguageStore } from '../state/appLanguageStore';

const Stack =
  createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const [initialRoute, setInitialRoute] =
    useState<keyof RootStackParamList | null>(
      null,
    );

  const initLanguage =
    useAppLanguageStore(
      (state) => state.initLanguage,
    );

  useEffect(() => {
    let isMounted = true;

    const checkPersistence = async () => {
      const persistedLanguage =
        await initLanguage();

      if (!isMounted) return;

      if (persistedLanguage) {
        setInitialRoute('RoleSelection');
      } else {
        setInitialRoute('LanguageGate');
      }
    };

    checkPersistence();

    return () => {
      isMounted = false;
    };
  }, [initLanguage]);

  if (!initialRoute) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#8B7CF6"
        />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="LanguageGate"
        component={LanguageGateScreen}
      />

      <Stack.Screen
        name="RoleSelection"
        component={RoleSelectionScreen}
      />

      <Stack.Screen
        name="Login"
        component={LoginScreen}
      />

      <Stack.Screen
        name="Home"
        component={HomeScreen}
      />

      <Stack.Screen
        name="GameCatalog"
        component={GameCatalogScreen}
      />

      <Stack.Screen
        name="SpeechSynthesis"
        component={SpeechSynthesisScreen}
      />

      <Stack.Screen
        name="ParentDashboard"
        component={ParentDashboardScreen}
      />

      <Stack.Screen
        name="TeacherDashboard"
        component={TeacherDashboardScreen}
      />

      <Stack.Screen
        name="Games"
        component={GamesNavigator}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1FBFB',
  },
});

export default RootNavigator;