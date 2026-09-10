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

const HOME_ART = require('../../assets/gyan-home-exact.png');

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.container}>
      {/* Background artwork */}
      <Image
        source={HOME_ART}
        style={styles.homeArtwork}
        resizeMode="stretch"
      />

      {/* Softens the artwork so the dashboard content stands out */}
      <View
        style={styles.backgroundOverlay}
        pointerEvents="none"
      />

      {/* Interactive layer */}
      <View
        style={styles.interactionLayer}
        pointerEvents="box-none"
      >
        <Pressable
          style={styles.profileButton}
          onPress={() => navigation.navigate('RoleSelection')}
          accessibilityRole="button"
          accessibilityLabel="Open profile"
        />

        <Pressable
          style={styles.speakButton}
          onPress={() => navigation.navigate('SpeechSynthesis')}
          accessibilityRole="button"
          accessibilityLabel="Open Speak and Listen"
        />

        <Pressable
          style={styles.playButton}
          onPress={() => navigation.navigate('GameCatalog')}
          accessibilityRole="button"
          accessibilityLabel="Open Play and Match"
        />

        <Pressable
          style={styles.continueButton}
          onPress={() => navigation.navigate('GameCatalog')}
          accessibilityRole="button"
          accessibilityLabel="Continue Learning"
        />

        <Pressable
          style={styles.goalButton}
          onPress={() => navigation.navigate('GameCatalog')}
          accessibilityRole="button"
          accessibilityLabel="Daily Goal"
        />

        <Pressable
          style={styles.rewardsButton}
          onPress={() => navigation.navigate('GameCatalog')}
          accessibilityRole="button"
          accessibilityLabel="Your Rewards"
        />

        <Pressable
          style={styles.basicsButton}
          onPress={() => navigation.navigate('GameCatalog')}
          accessibilityRole="button"
          accessibilityLabel="Basics"
        />

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
  container: {
    flex: 1,
    backgroundColor: '#DDEBFF',
  },

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

  backgroundOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.32)',
    zIndex: 1,
  },

  interactionLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    elevation: 10,
  },

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