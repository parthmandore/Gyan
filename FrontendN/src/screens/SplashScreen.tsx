import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { useAppLanguageStore } from '../state/appLanguageStore';

export const SplashScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const initLanguage = useAppLanguageStore(
    (state) => state.initLanguage,
  );

  const logoOpacity = useRef(
    new Animated.Value(0),
  ).current;

  const logoScale = useRef(
    new Animated.Value(0.88),
  ).current;

  const textOpacity = useRef(
    new Animated.Value(0),
  ).current;

  const textTranslateY = useRef(
    new Animated.Value(10),
  ).current;

  const bottomOpacity = useRef(
    new Animated.Value(0),
  ).current;

  useEffect(() => {
    let isMounted = true;

    let navigationTimer:
      | ReturnType<typeof setTimeout>
      | undefined;

    // Logo entrance
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 550,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),

      Animated.spring(logoScale, {
        toValue: 1,
        friction: 7,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();

    // Gyan branding appears shortly after logo
    const textTimer = setTimeout(() => {
      if (!isMounted) return;

      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 450,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),

        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 450,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    }, 300);

    // Bottom message
    const bottomTimer = setTimeout(() => {
      if (!isMounted) return;

      Animated.timing(bottomOpacity, {
        toValue: 1,
        duration: 450,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }, 750);

    // Decide where the app should go after splash
    const startApp = async () => {
      const persistedLanguage =
        await initLanguage();

      navigationTimer = setTimeout(() => {
        if (!isMounted) return;

        if (persistedLanguage) {
          navigation.replace('RoleSelection');
        } else {
          navigation.replace('LanguageGate');
        }
      }, 2500);
    };

    startApp();

    return () => {
      isMounted = false;

      clearTimeout(textTimer);
      clearTimeout(bottomTimer);

      if (navigationTimer) {
        clearTimeout(navigationTimer);
      }
    };
  }, [
    bottomOpacity,
    initLanguage,
    logoOpacity,
    logoScale,
    navigation,
    textOpacity,
    textTranslateY,
  ]);

  return (
    <View style={styles.container}>
      <View style={styles.centerContent}>
        {/* Gyan Logo */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [
                {
                  scale: logoScale,
                },
              ],
            },
          ]}
        >
          <Image
            source={require('../../assets/gyan-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Gyan Branding */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: textOpacity,
              transform: [
                {
                  translateY: textTranslateY,
                },
              ],
            },
          ]}
        >
          <Text style={styles.appName}>
            GYAN
          </Text>

          <Text style={styles.tagline}>
            Learn • Play • Grow
          </Text>
        </Animated.View>
      </View>

      {/* Bottom Message */}
      <Animated.View
        style={[
          styles.bottomContainer,
          {
            opacity: bottomOpacity,
          },
        ]}
      >
        <Text style={styles.bottomText}>
          Making learning fun
        </Text>

        <Text style={styles.sparkle}>
          ✨
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1FBFB',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },

  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -45,
  },

  logoContainer: {
    width: 275,
    height: 275,
    alignItems: 'center',
    justifyContent: 'center',
  },

  logo: {
    width: 275,
    height: 275,
  },

  textContainer: {
    alignItems: 'center',
    marginTop: -8,
  },

  appName: {
    fontSize: 43,
    fontWeight: '700',
    letterSpacing: 3,
    color: '#5B4BC4',
  },

  tagline: {
    marginTop: 7,
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.4,
    color: '#6B7280',
  },

  bottomContainer: {
    position: 'absolute',
    bottom: 48,
    flexDirection: 'row',
    alignItems: 'center',
  },

  bottomText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8B7CF6',
  },

  sparkle: {
    marginLeft: 4,
    fontSize: 14,
  },
});

export default SplashScreen;