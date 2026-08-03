/**
 * Purpose: Root stack navigator managing application entry flows: LanguageGate, GameCatalog, and Games stack.
 * Module: Navigation
 * Folder: frontend/src/navigation
 */

import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { LanguageGateScreen } from '../screens/LanguageGateScreen';
import { GameCatalogScreen } from '../screens/GameCatalogScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { GamesNavigator } from './GamesNavigator';
import { useAppLanguageStore } from '../state/appLanguageStore';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList | null>(null);
  const initLanguage = useAppLanguageStore((s) => s.initLanguage);

  useEffect(() => {
    let isMounted = true;
    const checkPersistence = async () => {
      const persistedLang = await initLanguage();
      if (isMounted) {
        if (persistedLang) {
          setInitialRoute('GameCatalog');
        } else {
          setInitialRoute('LanguageGate');
        }
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
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LanguageGate" component={LanguageGateScreen} />
      <Stack.Screen name="GameCatalog" component={GameCatalogScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Games" component={GamesNavigator} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1B2B5A',
  },
});
