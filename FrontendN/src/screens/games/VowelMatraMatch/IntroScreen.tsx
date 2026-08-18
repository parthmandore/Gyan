/**
 * Purpose: Intro / Tutorial Screen for Vowel & Matra Match game.
 * Module: Vowel Matra Match
 * Folder: frontend/src/screens/games/VowelMatraMatch
 */

import React, { useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { VowelMatraMatchStackParamList } from './types';
import { BigTouchTarget } from '../../../components/BigTouchTarget';
import { CartoonBackground } from '../../../components/CartoonBackground';
import { Colors } from '../../../theme/colors';
import { Typography } from '../../../theme/typography';
import { useVowelMatraMatchStore } from './store/vowelMatraMatchStore';

type NavProp = NativeStackNavigationProp<VowelMatraMatchStackParamList>;

export const IntroScreen: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavProp>();
  const resetSession = useVowelMatraMatchStore((s) => s.resetSession);

  const handleStart = useCallback(() => {
    resetSession();
    navigation.navigate('VowelMatraMatchGame');
  }, [resetSession, navigation]);

  const handleBack = useCallback(() => {
    navigation.getParent()?.goBack();
  }, [navigation]);

  return (
    <View style={styles.root}>
      <CartoonBackground theme="evening" />
      <StatusBar barStyle="light-content" backgroundColor="#1E1B4B" />

      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <BigTouchTarget onPress={handleBack} accessibilityLabel={t('common.back')} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </BigTouchTarget>
        </View>

        <View style={styles.content}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>🕉️</Text>
          </View>

          <Text style={styles.title}>{t('games.vowelMatraMatch.title')}</Text>
          <Text style={styles.description}>
            {t('games.vowelMatraMatch.description')}
          </Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('vowelMatraMatch.howToPlay')}</Text>
            <Text style={styles.cardItem}>1. {t('vowelMatraMatch.step1')}</Text>
            <Text style={styles.cardItem}>2. {t('vowelMatraMatch.step2')}</Text>
            <Text style={styles.cardItem}>3. {t('vowelMatraMatch.step3')}</Text>
          </View>

          <BigTouchTarget onPress={handleStart} accessibilityLabel={t('vowelMatraMatch.startPlaying')} style={styles.startButton}>
            <Text style={styles.startButtonText}>{t('vowelMatraMatch.startPlaying')}</Text>
          </BigTouchTarget>
        </View>
      </SafeAreaView>
    </View>
  );
});

IntroScreen.displayName = 'VowelMatraMatchIntroScreen';

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#1E1B4B',
  },
  safe: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 22,
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  iconText: {
    fontSize: 48,
  },
  title: {
    fontFamily: Typography.fonts.bold,
    fontSize: 28,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontFamily: Typography.fonts.medium,
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    marginBottom: 24,
  },
  card: {
    width: '100%',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: 20,
    marginBottom: 32,
  },
  cardTitle: {
    fontFamily: Typography.fonts.bold,
    fontSize: 18,
    color: '#FDE047',
    marginBottom: 12,
  },
  cardItem: {
    fontFamily: Typography.fonts.medium,
    fontSize: 15,
    color: '#F8FAFC',
    marginBottom: 8,
    lineHeight: 22,
  },
  startButton: {
    width: '100%',
    height: 60,
    backgroundColor: '#10B981',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  startButtonText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 20,
    color: '#FFFFFF',
  },
});
