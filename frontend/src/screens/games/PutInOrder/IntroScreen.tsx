/**
 * Purpose: Introduction and onboarding screen for Put in Order (Age 5).
 *          Presents the game concept, interactive preview, audio prompt, and launch CTA.
 * Module: Put in Order — Intro Screen
 * Folder: frontend/src/screens/games/PutInOrder
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { CartoonBackground, CloudClearanceSpacer } from '../../../components/CartoonBackground';
import { useAppLanguageStore } from '../../../state/appLanguageStore';
import { speakPhrase, stopSpeech } from '../../../services/speechService';
import { OrderSlotTarget } from './components/OrderSlotTarget';
import { RootStackParamList } from '../../../types';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export const IntroScreen: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavProp>();
  const { width: screenWidth } = useWindowDimensions();

  const motherTongue = useAppLanguageStore((s) => s.motherTongue) || 'en';
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  // Spoken introduction on mount
  useEffect(() => {
    const welcomeText = t(
      'putInOrder.heroSubtitle',
      'Arrange the cards in the correct sequence from start to finish!'
    );
    speakPhrase(welcomeText, { language: motherTongue });

    const unsubscribe = navigation.addListener('beforeRemove', () => {
      stopSpeech();
    });

    return () => {
      stopSpeech();
      unsubscribe();
    };
  }, [t, motherTongue, navigation]);

  const handleStartGame = () => {
    stopSpeech();
    navigation.navigate('Games', { screen: 'PutInOrderGame' as any });
  };

  const isTablet = screenWidth >= 600;
  const contentMaxWidth = isTablet ? 560 : 420;

  return (
    <View style={styles.container}>
      <CartoonBackground theme="puzzle" />

      {/* Top Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            stopSpeech();
            navigation.goBack();
          }}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.infoButton}
          onPress={() => setShowHowToPlay(true)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="How to play"
        >
          <Text style={styles.infoButtonText}>ℹ️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { maxWidth: contentMaxWidth }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Age & Topic Badge */}
        <View style={styles.badgeRow}>
          <View style={styles.ageBadge}>
            <Text style={styles.ageBadgeText}>
              {t('putInOrder.badge', '⭐ Age 5 Sequencing Quest')}
            </Text>
          </View>
        </View>

        {/* Hero Title & Subtitle */}
        <Text style={styles.heroTitle}>
          {t('putInOrder.heroTitle', 'Put in Order! 🧩')}
        </Text>
        <Text style={styles.heroSubtitle}>
          {t(
            'putInOrder.heroSubtitle',
            'Arrange the cards in the correct sequence from start to finish!'
          )}
        </Text>

        {/* Interactive Sequence Preview */}
        <View style={styles.previewContainer}>
          <View style={styles.previewCard}>
            <Text style={styles.previewTitle}>
              {t('putInOrder.previewTitle', 'Sample Order ➔')}
            </Text>
            <View style={styles.previewSlotsRow}>
              <OrderSlotTarget
                slotIndex={0}
                item={{ id: 'p1', display: '1', orderIndex: 0 }}
                status="correct"
                disabled={true}
                slotSize={72}
                onPressSlot={() => {}}
              />
              <Text style={styles.previewArrow}>➔</Text>
              <OrderSlotTarget
                slotIndex={1}
                item={{ id: 'p2', display: '2', orderIndex: 1 }}
                status="correct"
                disabled={true}
                slotSize={72}
                onPressSlot={() => {}}
              />
              <Text style={styles.previewArrow}>➔</Text>
              <OrderSlotTarget
                slotIndex={2}
                item={{ id: 'p3', display: '3', orderIndex: 2 }}
                status="correct"
                disabled={true}
                slotSize={72}
                onPressSlot={() => {}}
              />
            </View>
          </View>
        </View>

        {/* Quick Tip */}
        <View style={styles.tipCard}>
          <Text style={styles.tipIcon}>💡</Text>
          <Text style={styles.tipText}>
            {t(
              'putInOrder.tip',
              'Tap a card in the tray to place it. Tap any placed card to remove it!'
            )}
          </Text>
        </View>

        {/* Start Game CTA Button */}
        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartGame}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Start game"
        >
          <Text style={styles.startButtonText}>
            {t('putInOrder.startGame', 'Start Ordering! 🚀')}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* How to Play Modal */}
      <Modal
        visible={showHowToPlay}
        transparent
        animationType="fade"
        onRequestClose={() => setShowHowToPlay(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxWidth: contentMaxWidth }]}>
            <Text style={styles.modalTitle}>
              {t('putInOrder.howToPlayTitle', 'How to Play 📖')}
            </Text>

            <View style={styles.stepItem}>
              <Text style={styles.stepNumber}>1</Text>
              <Text style={styles.stepText}>
                {t(
                  'putInOrder.howToPlayStep1',
                  'Look at the scrambled cards in the tray below.'
                )}
              </Text>
            </View>

            <View style={styles.stepItem}>
              <Text style={styles.stepNumber}>2</Text>
              <Text style={styles.stepText}>
                {t(
                  'putInOrder.howToPlayStep2',
                  'Tap each card in order to place it in the empty slots: 1st, 2nd, 3rd!'
                )}
              </Text>
            </View>

            <View style={styles.stepItem}>
              <Text style={styles.stepNumber}>3</Text>
              <Text style={styles.stepText}>
                {t(
                  'putInOrder.howToPlayStep3',
                  'Tap any card in a slot if you want to put it back in the tray!'
                )}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowHowToPlay(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.modalCloseButtonText}>
                {t('common.gotIt', 'Got It! 👍')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF2FF',
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
    zIndex: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
  },
  infoButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoButtonText: {
    fontSize: 20,
  },
  scrollContent: {
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  badgeRow: {
    marginTop: 10,
    marginBottom: 12,
  },
  ageBadge: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  ageBadgeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroSubtitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F1F5F9',
    textAlign: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
    lineHeight: 22,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  previewContainer: {
    width: '100%',
    marginVertical: 6,
  },
  previewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#C7D2FE',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#4F46E5',
    marginBottom: 12,
  },
  previewSlotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewArrow: {
    fontSize: 18,
    fontWeight: '900',
    color: '#818CF8',
    marginHorizontal: 4,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginVertical: 14,
    width: '100%',
    borderWidth: 2,
    borderColor: '#C7D2FE',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  tipIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#3730A3',
    lineHeight: 20,
  },
  startButton: {
    backgroundColor: '#F59E0B',
    width: '100%',
    paddingVertical: 18,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#D97706',
    borderBottomWidth: 6,
    borderBottomColor: '#B45309',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
    marginTop: 10,
  },
  startButtonText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 20,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6366F1',
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 32,
    marginRight: 14,
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
    lineHeight: 20,
  },
  modalCloseButton: {
    marginTop: 10,
    backgroundColor: '#6366F1',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 16,
  },
  modalCloseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
