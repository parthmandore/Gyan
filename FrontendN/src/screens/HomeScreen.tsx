import React from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Exact Gyan student dashboard artwork
const HOME_ART = require('../../assets/gyan-home-exact.png');

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.container}>

      {/* ============================================================
          EXACT GYAN HOME ARTWORK
          ============================================================ */}

      <Image
        source={HOME_ART}
        style={styles.homeArtwork}
        resizeMode="stretch"
      />

      {/* ============================================================
          INTERACTION LAYER
          ============================================================ */}

      <View
        style={styles.interactionLayer}
        pointerEvents="box-none"
      >

        {/* ==========================================================
            PROFILE / SETTINGS
            ========================================================== */}

        <Pressable
          style={styles.profileButton}
          onPress={() => navigation.navigate('RoleSelection')}
          accessibilityRole="button"
          accessibilityLabel="Open profile"
        />

        {/* ==========================================================
            SPEAK & LISTEN
            PURPLE CARD
            ========================================================== */}

        <Pressable
          style={styles.speakButton}
          onPress={() => navigation.navigate('SpeechSynthesis')}
          accessibilityRole="button"
          accessibilityLabel="Open Speak and Listen"
        />

        {/* ==========================================================
            PLAY & MATCH
            GREEN CARD
            ========================================================== */}

        <Pressable
          style={styles.playButton}
          onPress={() => navigation.navigate('GameCatalog')}
          accessibilityRole="button"
          accessibilityLabel="Open Play and Match"
        />

        {/* ==========================================================
            CONTINUE LEARNING
            ========================================================== */}

        <Pressable
          style={styles.continueButton}
          onPress={() => navigation.navigate('GameCatalog')}
          accessibilityRole="button"
          accessibilityLabel="Continue Learning"
        />

        {/* ==========================================================
            DAILY GOAL
            ========================================================== */}

        <Pressable
          style={styles.goalButton}
          onPress={() => navigation.navigate('GameCatalog')}
          accessibilityRole="button"
          accessibilityLabel="Daily Goal"
        />

        {/* ==========================================================
            YOUR REWARDS
            ========================================================== */}

        <Pressable
          style={styles.rewardsButton}
          onPress={() => navigation.navigate('GameCatalog')}
          accessibilityRole="button"
          accessibilityLabel="Your Rewards"
        />

        {/* ==========================================================
            BASICS
            ========================================================== */}

        <Pressable
          style={styles.basicsButton}
          onPress={() => navigation.navigate('GameCatalog')}
          accessibilityRole="button"
          accessibilityLabel="Basics"
        />

        {/* ==========================================================
            WORDS
            ========================================================== */}

        <Pressable
          style={styles.wordsButton}
          onPress={() => navigation.navigate('GameCatalog')}
          accessibilityRole="button"
          accessibilityLabel="Words"
        />

      </View>
    </View>
  );
};

const styles = StyleSheet.create({

  /* ================================================================
     SCREEN
     ================================================================ */

  container: {
    flex: 1,
    backgroundColor: '#DDEBFF',
  },

  /* ================================================================
     ARTWORK
     ================================================================ */

  homeArtwork: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: 0,
  },

  /* ================================================================
     INTERACTION LAYER
     ================================================================ */

  interactionLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    elevation: 10,
  },

  /* ================================================================
     PROFILE / SETTINGS
     ================================================================ */

  profileButton: {
    position: 'absolute',
    top: '2%',
    right: '3%',
    width: '17%',
    height: '9%',
    backgroundColor: 'transparent',
    zIndex: 20,
    elevation: 20,
  },

  /* ================================================================
     SPEAK & LISTEN
     PURPLE CARD
     ================================================================ */

  speakButton: {
    position: 'absolute',
    left: '4%',
    top: '43%',
    width: '46%',
    height: '21%',
    backgroundColor: 'transparent',
    zIndex: 30,
    elevation: 30,
  },

  /* ================================================================
     PLAY & MATCH
     GREEN CARD
     ================================================================ */

  playButton: {
    position: 'absolute',
    right: '4%',
    top: '43%',
    width: '46%',
    height: '21%',
    backgroundColor: 'transparent',
    zIndex: 30,
    elevation: 30,
  },

  /* ================================================================
     THREE SMALL CARDS
     ================================================================ */

  continueButton: {
    position: 'absolute',
    left: '4%',
    top: '65%',
    width: '29%',
    height: '8%',
    backgroundColor: 'transparent',
    zIndex: 30,
    elevation: 30,
  },

  goalButton: {
    position: 'absolute',
    left: '35.5%',
    top: '65%',
    width: '29%',
    height: '8%',
    backgroundColor: 'transparent',
    zIndex: 30,
    elevation: 30,
  },

  rewardsButton: {
    position: 'absolute',
    right: '4%',
    top: '65%',
    width: '29%',
    height: '8%',
    backgroundColor: 'transparent',
    zIndex: 30,
    elevation: 30,
  },

  /* ================================================================
     LEARNING PATH
     ================================================================ */

  basicsButton: {
    position: 'absolute',
    left: '12%',
    top: '74%',
    width: '25%',
    height: '11%',
    backgroundColor: 'transparent',
    zIndex: 30,
    elevation: 30,
  },

  wordsButton: {
    position: 'absolute',
    left: '36%',
    top: '74%',
    width: '25%',
    height: '11%',
    backgroundColor: 'transparent',
    zIndex: 30,
    elevation: 30,
  },

});

export default HomeScreen;