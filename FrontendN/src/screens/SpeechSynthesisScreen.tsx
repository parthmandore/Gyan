/**
 * Purpose: Speech Studio — AI-powered listening and speech practice.
 * Module: Screens
 * Folder: frontend/src/screens
 */

import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { Typography } from '../theme/typography';

const COLORS = {
  background: '#F1FBFB',
  white: '#FFFDFC',
  navy: '#173B5E',
  muted: '#527087',

  lavender: '#8B7CF6',
  lavenderDark: '#6655D8',
  lavenderLight: '#F0EDFF',
  lavenderBorder: '#C4BCFF',

  coral: '#FF8A7A',
  coralLight: '#FFE5E0',

  mint: '#55CFA3',
  mintLight: '#E5F8F0',
  mintDark: '#217A5D',

  yellow: '#FFD45C',
  yellowLight: '#FFF4C7',
  yellowDark: '#A85B00',

  border: '#DCE8EC',
  green: '#2F9E67',
  greenLight: '#E8F8EF',
};

const languages = [
  {
    code: 'en',
    name: 'English',
    native: 'English',
    flag: '🇬🇧',
    color: COLORS.lavender,
    lightColor: COLORS.lavenderLight,
  },
  {
    code: 'hi',
    name: 'Hindi',
    native: 'हिन्दी',
    flag: '🇮🇳',
    color: COLORS.coral,
    lightColor: COLORS.coralLight,
  },
  {
    code: 'mr',
    name: 'Marathi',
    native: 'मराठी',
    flag: '🇮🇳',
    color: COLORS.mint,
    lightColor: COLORS.mintLight,
  },
];

export const SpeechSynthesisScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);
  const [text, setText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasAudio, setHasAudio] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleGenerate = () => {
    if (!text.trim()) {
      return;
    }

    setIsGenerating(true);
    setHasAudio(false);
    setIsPlaying(false);

    setTimeout(() => {
      setIsGenerating(false);
      setHasAudio(true);
    }, 1500);
  };

  const handlePlay = () => {
    setIsPlaying((previous) => !previous);
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      {/* HEADER */}

      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.pressedSmall,
          ]}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={COLORS.navy}
          />
        </Pressable>

        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>
            Speech Studio
          </Text>

          <Text style={styles.headerSubtitle}>
            Listen, practise & learn
          </Text>
        </View>

        <View style={styles.headerIcon}>
          <Ionicons
            name="volume-high"
            size={24}
            color={COLORS.lavenderDark}
          />
        </View>
      </View>

      {/* CONTENT */}

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="none"
      >
        {/* HERO */}

        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroIcon}>
              <Ionicons
                name="volume-high"
                size={30}
                color={COLORS.lavenderDark}
              />
            </View>

            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>
                AI SPEECH
              </Text>
            </View>
          </View>

          <Text style={styles.heroTitle}>
            Hear It. Learn It.
          </Text>

          <Text style={styles.heroDescription}>
            Type a word or sentence and hear how it sounds
            in your chosen language.
          </Text>

          <View style={styles.heroDecorationOne} />
          <View style={styles.heroDecorationTwo} />
        </View>

        {/* LANGUAGE */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Choose your language
          </Text>

          <Text style={styles.sectionSubtitle}>
            Select the language you want to practise
          </Text>
        </View>

        <View style={styles.languageRow}>
          {languages.map((language) => {
            const selected =
              selectedLanguage.code === language.code;

            return (
              <Pressable
                key={language.code}
                style={({ pressed }) => [
                  styles.languageCard,
                  {
                    borderColor: selected
                      ? language.color
                      : COLORS.border,
                    backgroundColor: selected
                      ? language.lightColor
                      : COLORS.white,
                  },
                  pressed && styles.pressedSmall,
                ]}
                onPress={() => {
                  setSelectedLanguage(language);
                  setHasAudio(false);
                  setIsPlaying(false);
                }}
                accessibilityRole="button"
                accessibilityLabel={`Select ${language.name}`}
                accessibilityState={{ selected }}
              >
                <Text style={styles.flag}>
                  {language.flag}
                </Text>

                <Text
                  style={[
                    styles.languageName,
                    {
                      color: selected
                        ? language.color === COLORS.coral
                          ? '#C75447'
                          : language.color === COLORS.mint
                            ? COLORS.mintDark
                            : COLORS.lavenderDark
                        : COLORS.navy,
                    },
                  ]}
                >
                  {language.native}
                </Text>

                {selected && (
                  <View
                    style={[
                      styles.check,
                      {
                        backgroundColor: language.color,
                      },
                    ]}
                  >
                    <Ionicons
                      name="checkmark"
                      size={14}
                      color="#FFFFFF"
                    />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* TEXT INPUT */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            What do you want to hear?
          </Text>

          <Text style={styles.sectionSubtitle}>
            Try a word, phrase or short sentence
          </Text>
        </View>

        <View style={styles.inputCard}>
          <View style={styles.inputTopRow}>
            <View style={styles.inputIcon}>
              <Ionicons
                name="create-outline"
                size={20}
                color={COLORS.lavenderDark}
              />
            </View>

            <Text style={styles.inputHint}>
              Your text
            </Text>
          </View>

          {/* NATIVE TEXT INPUT — NO PRESSABLE WRAPPER */}

          <TextInput
            value={text}
            onChangeText={(value) => {
              setText(value);

              if (hasAudio) {
                setHasAudio(false);
                setIsPlaying(false);
              }
            }}
            placeholder="Type a word or sentence..."
            placeholderTextColor="#8AA0AF"
            multiline
            maxLength={200}
            style={styles.input}
            textAlignVertical="top"
            autoCorrect
            autoCapitalize="sentences"
            blurOnSubmit={false}
            returnKeyType="default"
            accessibilityLabel="Speech text input"
          />

          <View style={styles.inputFooter}>
            <Text style={styles.exampleText}>
              Example: butterfly
            </Text>

            <Text style={styles.characterCount}>
              {text.length}/200
            </Text>
          </View>
        </View>

        {/* GENERATE BUTTON */}

        <Pressable
          style={({ pressed }) => [
            styles.generateButton,
            !text.trim() && styles.generateButtonDisabled,
            pressed &&
              !!text.trim() &&
              styles.generateButtonPressed,
          ]}
          onPress={handleGenerate}
          disabled={!text.trim() || isGenerating}
          accessibilityRole="button"
          accessibilityLabel="Generate speech"
        >
          {isGenerating ? (
            <>
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />

              <Text style={styles.generateButtonText}>
                Creating your audio...
              </Text>
            </>
          ) : (
            <>
              <Ionicons
                name="volume-high"
                size={23}
                color="#FFFFFF"
              />

              <Text style={styles.generateButtonText}>
                Generate Speech
              </Text>

              <View style={styles.generateArrow}>
                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color="#FFFFFF"
                />
              </View>
            </>
          )}
        </Pressable>

        {/* AUDIO RESULT */}

        {hasAudio && (
          <View style={styles.audioCard}>
            <View style={styles.readyBadge}>
              <Ionicons
                name="checkmark-circle"
                size={17}
                color={COLORS.green}
              />

              <Text style={styles.readyBadgeText}>
                Ready to hear
              </Text>
            </View>

            <View style={styles.audioHeader}>
              <View style={styles.audioTitleContainer}>
                <Text style={styles.audioTitle}>
                  Your audio
                </Text>

                <Text style={styles.audioSubtitle}>
                  {selectedLanguage.native}
                </Text>
              </View>

              <View style={styles.audioIcon}>
                <Ionicons
                  name="volume-high"
                  size={23}
                  color={COLORS.lavenderDark}
                />
              </View>
            </View>

            <View style={styles.wordPreview}>
              <Text style={styles.wordPreviewText}>
                “{text.trim()}”
              </Text>
            </View>

            <View style={styles.player}>
              <Pressable
                style={({ pressed }) => [
                  styles.playButton,
                  pressed && styles.pressedSmall,
                ]}
                onPress={handlePlay}
                accessibilityRole="button"
                accessibilityLabel={
                  isPlaying
                    ? 'Pause audio'
                    : 'Play audio'
                }
              >
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={23}
                  color="#FFFFFF"
                />
              </Pressable>

              <View style={styles.progressContainer}>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: isPlaying
                          ? '35%'
                          : '0%',
                      },
                    ]}
                  />
                </View>

                <View style={styles.timeRow}>
                  <Text style={styles.timeText}>
                    {isPlaying ? '0:04' : '0:00'}
                  </Text>

                  <Text style={styles.timeText}>
                    0:12
                  </Text>
                </View>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.regenerateButton,
                pressed && styles.pressedSmall,
              ]}
              onPress={handleGenerate}
              accessibilityRole="button"
              accessibilityLabel="Generate speech again"
            >
              <Ionicons
                name="refresh"
                size={18}
                color={COLORS.lavenderDark}
              />

              <Text style={styles.regenerateText}>
                Generate Again
              </Text>
            </Pressable>
          </View>
        )}

        {/* INFO */}

        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Ionicons
              name="sparkles"
              size={19}
              color={COLORS.yellowDark}
            />
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>
              AI-powered learning
            </Text>

            <Text style={styles.infoText}>
              Speech generation will use the LingoBloom
              AI voice engine.
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 40,
  },

  /* HEADER */

  header: {
    minHeight: 76,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    zIndex: 20,
  },

  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4F8F9',
  },

  headerTextContainer: {
    flex: 1,
    marginLeft: 14,
  },

  headerTitle: {
    fontFamily: Typography.fonts.bold,
    fontSize: 24,
    color: COLORS.navy,
  },

  headerSubtitle: {
    marginTop: 2,
    fontFamily: Typography.fonts.medium,
    fontSize: 14,
    color: COLORS.muted,
  },

  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.lavenderLight,
    borderWidth: 1.5,
    borderColor: COLORS.lavenderBorder,
  },

  /* HERO */

  heroCard: {
    minHeight: 230,
    padding: 22,
    borderRadius: 26,
    backgroundColor: COLORS.lavender,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderBottomWidth: 7,
    borderBottomColor: COLORS.lavenderDark,
    overflow: 'hidden',

    shadowColor: COLORS.navy,
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.17,
    shadowRadius: 9,
    elevation: 7,
  },

  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  heroIcon: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },

  heroBadge: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: COLORS.yellowLight,
  },

  heroBadgeText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 11,
    color: COLORS.yellowDark,
  },

  heroTitle: {
    marginTop: 18,
    fontFamily: Typography.fonts.bold,
    fontSize: 29,
    color: '#FFFFFF',
  },

  heroDescription: {
    marginTop: 6,
    maxWidth: 345,
    fontFamily: Typography.fonts.medium,
    fontSize: 15,
    lineHeight: 22,
    color: '#F4F1FF',
  },

  heroDecorationOne: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    right: -45,
    bottom: -65,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },

  heroDecorationTwo: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    right: 55,
    top: -35,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },

  /* SECTION */

  sectionHeader: {
    marginTop: 25,
    marginBottom: 11,
  },

  sectionTitle: {
    fontFamily: Typography.fonts.bold,
    fontSize: 20,
    color: COLORS.navy,
  },

  sectionSubtitle: {
    marginTop: 4,
    fontFamily: Typography.fonts.medium,
    fontSize: 13,
    color: COLORS.muted,
  },

  /* LANGUAGE */

  languageRow: {
    flexDirection: 'row',
    gap: 10,
  },

  languageCard: {
    flex: 1,
    minHeight: 104,
    padding: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },

  flag: {
    fontSize: 26,
  },

  languageName: {
    marginTop: 7,
    fontFamily: Typography.fonts.bold,
    fontSize: 16,
  },

  check: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* INPUT */

  inputCard: {
    padding: 16,
    borderRadius: 23,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.lavender,
    borderBottomWidth: 4,
    borderBottomColor: COLORS.lavenderBorder,

    shadowColor: COLORS.navy,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 7,
    elevation: 4,
  },

  inputTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  inputIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.lavenderLight,
  },

  inputHint: {
    marginLeft: 9,
    fontFamily: Typography.fonts.bold,
    fontSize: 13,
    color: COLORS.muted,
  },

  /*
   * The TextInput itself owns the complete typing area.
   * There is intentionally NO Pressable wrapper here.
   */

  input: {
    width: '100%',
    height: 115,
    marginTop: 10,
    paddingHorizontal: 5,
    paddingTop: 8,
    paddingBottom: 8,

    fontFamily: Typography.fonts.medium,
    fontSize: 19,
    lineHeight: 28,
    color: COLORS.navy,

    textAlignVertical: 'top',
    includeFontPadding: true,
  },

  inputFooter: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  exampleText: {
    fontFamily: Typography.fonts.medium,
    fontSize: 12,
    color: COLORS.muted,
  },

  characterCount: {
    fontFamily: Typography.fonts.bold,
    fontSize: 12,
    color: COLORS.muted,
  },

  /* GENERATE */

  generateButton: {
    minHeight: 60,
    marginTop: 18,
    paddingLeft: 20,
    paddingRight: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: COLORS.lavender,

    shadowColor: COLORS.navy,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.14,
    shadowRadius: 7,
    elevation: 5,
  },

  generateButtonDisabled: {
    opacity: 0.45,
  },

  generateButtonPressed: {
    transform: [{ scale: 0.985 }],
  },

  generateButtonText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 18,
    color: '#FFFFFF',
  },

  generateArrow: {
    width: 43,
    height: 43,
    marginLeft: 4,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.lavenderDark,
  },

  /* AUDIO */

  audioCard: {
    marginTop: 20,
    padding: 20,
    borderRadius: 25,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.mint,
    borderBottomWidth: 5,
    borderBottomColor: '#2B9F78',

    shadowColor: COLORS.navy,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 5,
  },

  readyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.greenLight,
  },

  readyBadgeText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 12,
    color: COLORS.green,
  },

  audioHeader: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  audioTitleContainer: {
    flex: 1,
  },

  audioTitle: {
    fontFamily: Typography.fonts.bold,
    fontSize: 22,
    color: COLORS.navy,
  },

  audioSubtitle: {
    marginTop: 3,
    fontFamily: Typography.fonts.medium,
    fontSize: 14,
    color: COLORS.muted,
  },

  audioIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.lavenderLight,
  },

  wordPreview: {
    marginTop: 17,
    padding: 15,
    borderRadius: 15,
    backgroundColor: '#F5F8FA',
  },

  wordPreviewText: {
    fontFamily: Typography.fonts.semibold,
    fontSize: 17,
    color: COLORS.navy,
  },

  player: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },

  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.lavender,
  },

  progressContainer: {
    flex: 1,
    marginLeft: 14,
  },

  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#E1E9ED',
  },

  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: COLORS.lavender,
  },

  timeRow: {
    marginTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  timeText: {
    fontFamily: Typography.fonts.medium,
    fontSize: 12,
    color: COLORS.muted,
  },

  regenerateButton: {
    marginTop: 18,
    minHeight: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    backgroundColor: COLORS.lavenderLight,
  },

  regenerateText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 15,
    color: COLORS.lavenderDark,
  },

  /* INFO */

  infoCard: {
    marginTop: 20,
    padding: 15,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.yellowLight,
    borderWidth: 1.5,
    borderColor: '#FFE49A',
  },

  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },

  infoContent: {
    flex: 1,
    marginLeft: 10,
  },

  infoTitle: {
    fontFamily: Typography.fonts.bold,
    fontSize: 13,
    color: COLORS.yellowDark,
  },

  infoText: {
    marginTop: 3,
    fontFamily: Typography.fonts.medium,
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.muted,
  },

  bottomSpacing: {
    height: 20,
  },

  pressedSmall: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});

export default SpeechSynthesisScreen;