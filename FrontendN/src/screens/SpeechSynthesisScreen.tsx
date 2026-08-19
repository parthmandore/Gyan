/**
 * Purpose: Speech Studio — AI-powered listening and speech practice.
 * Module: Screens
 * Folder: frontend/src/screens
 */

import React, {
  memo,
  useCallback,
  useRef,
  useState,
} from 'react';
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

import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';

const languages = [
  {
    code: 'en',
    name: 'English',
    native: 'English',
    flag: '🇬🇧',
  },
  {
    code: 'hi',
    name: 'Hindi',
    native: 'हिन्दी',
    flag: '🇮🇳',
  },
  {
    code: 'mr',
    name: 'Marathi',
    native: 'मराठी',
    flag: '🇮🇳',
  },
];

interface TextInputSectionProps {
  textRef: React.MutableRefObject<string>;
  onHasTextChange: (hasText: boolean) => void;
  onTyping: () => void;
}

/*
 * IMPORTANT:
 * The typing state lives INSIDE this small component.
 * The entire Speech Studio screen does not re-render
 * every time the user presses a key.
 */
const TextInputSection = memo(
  ({
    textRef,
    onHasTextChange,
    onTyping,
  }: TextInputSectionProps) => {
    const [characterCount, setCharacterCount] = useState(0);

    const handleChangeText = useCallback(
      (value: string) => {
        textRef.current = value;

        setCharacterCount(value.length);

        onHasTextChange(value.trim().length > 0);
        onTyping();
      },
      [textRef, onHasTextChange, onTyping]
    );

    return (
      <View style={styles.inputCard}>
        <View style={styles.inputTopRow}>
          <View style={styles.inputIcon}>
            <Ionicons
              name="create-outline"
              size={20}
              color={Colors.primary.main}
            />
          </View>

          <Text style={styles.inputHint}>
            Your text
          </Text>
        </View>

        <TextInput
          defaultValue=""
          onChangeText={handleChangeText}
          placeholder="Type a word or sentence..."
          placeholderTextColor={Colors.neutral.textMuted}
          multiline
          maxLength={200}
          style={styles.input}
          textAlignVertical="top"
          autoCorrect
          autoCapitalize="sentences"
          keyboardType="default"
          returnKeyType="default"
          blurOnSubmit={false}
          accessibilityLabel="Speech text input"
        />

        <View style={styles.inputFooter}>
          <Text style={styles.exampleText}>
            Example: butterfly
          </Text>

          <Text style={styles.characterCount}>
            {characterCount}/200
          </Text>
        </View>
      </View>
    );
  }
);

TextInputSection.displayName = 'TextInputSection';

export const SpeechSynthesisScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const textRef = useRef('');
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);

  const [hasText, setHasText] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasAudio, setHasAudio] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleHasTextChange = useCallback(
    (value: boolean) => {
      setHasText((previous) => {
        if (previous === value) {
          return previous;
        }

        return value;
      });
    },
    []
  );

  const handleTyping = useCallback(() => {
    if (hasAudio) {
      setHasAudio(false);
      setIsPlaying(false);
    }
  }, [hasAudio]);

  const handleGenerate = useCallback(() => {
    const currentText = textRef.current.trim();

    if (!currentText || isGenerating) {
      return;
    }

    setIsGenerating(true);
    setHasAudio(false);
    setIsPlaying(false);

    // Temporary frontend mock.
    // Backend team can replace this with the MelGAN/API call.
    setTimeout(() => {
      setIsGenerating(false);
      setHasAudio(true);
    }, 1500);
  }, [isGenerating]);

  const handlePlay = useCallback(() => {
    setIsPlaying((previous) => !previous);
  }, []);

  const handleLanguageSelect = useCallback(
    (language: (typeof languages)[number]) => {
      setSelectedLanguage(language);
      setHasAudio(false);
      setIsPlaying(false);
    },
    []
  );

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
            size={23}
            color={Colors.neutral.textDark}
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
            color={Colors.primary.main}
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
      >
        {/* HERO */}
        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Ionicons
              name="volume-high"
              size={30}
              color={Colors.primary.main}
            />
          </View>

          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>
              AI SPEECH
            </Text>
          </View>

          <Text style={styles.heroTitle}>
            Hear It. Learn It.
          </Text>

          <Text style={styles.heroDescription}>
            Type a word or sentence and hear how it sounds in your chosen
            language.
          </Text>
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
                  selected && styles.languageCardSelected,
                  pressed && styles.pressedSmall,
                ]}
                onPress={() => handleLanguageSelect(language)}
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
                    selected && styles.languageNameSelected,
                  ]}
                >
                  {language.native}
                </Text>

                {selected && (
                  <View style={styles.check}>
                    <Ionicons
                      name="checkmark"
                      size={14}
                      color={Colors.neutral.surface}
                    />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* INPUT SECTION */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            What do you want to hear?
          </Text>

          <Text style={styles.sectionSubtitle}>
            Try a word, phrase or short sentence
          </Text>
        </View>

        <TextInputSection
          textRef={textRef}
          onHasTextChange={handleHasTextChange}
          onTyping={handleTyping}
        />

        {/* GENERATE BUTTON */}
        <Pressable
          style={({ pressed }) => [
            styles.generateButton,
            !hasText && styles.generateButtonDisabled,
            pressed &&
              hasText &&
              !isGenerating &&
              styles.generateButtonPressed,
          ]}
          onPress={handleGenerate}
          disabled={!hasText || isGenerating}
          accessibilityRole="button"
          accessibilityLabel="Generate speech"
        >
          {isGenerating ? (
            <>
              <ActivityIndicator
                size="small"
                color={Colors.neutral.surface}
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
                color={Colors.neutral.surface}
              />

              <Text style={styles.generateButtonText}>
                Generate Speech
              </Text>

              <View style={styles.generateArrow}>
                <Ionicons
                  name="arrow-forward"
                  size={17}
                  color={Colors.neutral.surface}
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
                color={Colors.feedback.correctText}
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
                  color={Colors.primary.main}
                />
              </View>
            </View>

            <View style={styles.wordPreview}>
              <Text style={styles.wordPreviewText}>
                “{textRef.current.trim()}”
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
                  isPlaying ? 'Pause audio' : 'Play audio'
                }
              >
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={23}
                  color={Colors.neutral.surface}
                />
              </Pressable>

              <View style={styles.progressContainer}>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: isPlaying ? '35%' : '0%',
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
                color={Colors.primary.main}
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
              size={18}
              color={Colors.accent.amberDark}
            />
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>
              AI-powered learning
            </Text>

            <Text style={styles.infoText}>
              Speech generation will use the LingoBloom AI voice engine.
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
    backgroundColor: Colors.neutral.background,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 40,
  },

  header: {
    minHeight: 76,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.border,
  },

  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.neutral.background,
  },

  headerTextContainer: {
    flex: 1,
    marginLeft: 14,
  },

  headerTitle: {
    fontFamily: Typography.fonts.bold,
    fontSize: 24,
    color: Colors.neutral.textDark,
  },

  headerSubtitle: {
    marginTop: 2,
    fontFamily: Typography.fonts.regular,
    fontSize: 14,
    color: Colors.neutral.textMuted,
  },

  headerIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary.surface,
  },

  heroCard: {
    padding: 20,
    borderRadius: 24,
    backgroundColor: Colors.primary.main,
    overflow: 'hidden',
  },

  heroIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.neutral.surface,
  },

  heroBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: Colors.accent.amberSurface,
  },

  heroBadgeText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 11,
    color: Colors.accent.amberDark,
  },

  heroTitle: {
    marginTop: 16,
    fontFamily: Typography.fonts.bold,
    fontSize: 28,
    color: Colors.neutral.surface,
  },

  heroDescription: {
    marginTop: 6,
    maxWidth: 340,
    fontFamily: Typography.fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    color: '#E8F0FF',
  },

  sectionHeader: {
    marginTop: 24,
    marginBottom: 12,
  },

  sectionTitle: {
    fontFamily: Typography.fonts.bold,
    fontSize: 19,
    color: Colors.neutral.textDark,
  },

  sectionSubtitle: {
    marginTop: 3,
    fontFamily: Typography.fonts.regular,
    fontSize: 13,
    color: Colors.neutral.textMuted,
  },

  languageRow: {
    flexDirection: 'row',
    gap: 10,
  },

  languageCard: {
    flex: 1,
    minHeight: 94,
    padding: 10,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.neutral.surface,
    borderWidth: 2,
    borderColor: Colors.neutral.border,
  },

  languageCardSelected: {
    borderColor: Colors.primary.main,
    backgroundColor: Colors.primary.surface,
  },

  flag: {
    fontSize: 25,
  },

  languageName: {
    marginTop: 6,
    fontFamily: Typography.fonts.semibold,
    fontSize: 16,
    color: Colors.neutral.textDark,
  },

  languageNameSelected: {
    color: Colors.primary.dark,
  },

  check: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary.main,
  },

  inputCard: {
    minHeight: 175,
    padding: 16,
    borderRadius: 22,
    backgroundColor: Colors.neutral.surface,
    borderWidth: 2,
    borderColor: Colors.primary.light,
  },

  inputTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  inputIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary.surface,
  },

  inputHint: {
    marginLeft: 9,
    fontFamily: Typography.fonts.semibold,
    fontSize: 13,
    color: Colors.neutral.textMuted,
  },

  input: {
    minHeight: 85,
    marginTop: 8,
    padding: 0,
    fontFamily: Typography.fonts.regular,
    fontSize: 19,
    lineHeight: 28,
    color: Colors.neutral.textDark,
  },

  inputFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  exampleText: {
    fontFamily: Typography.fonts.regular,
    fontSize: 12,
    color: Colors.neutral.textMuted,
  },

  characterCount: {
    fontFamily: Typography.fonts.regular,
    fontSize: 12,
    color: Colors.neutral.textMuted,
  },

  generateButton: {
    minHeight: 60,
    marginTop: 18,
    paddingLeft: 20,
    paddingRight: 8,
    borderRadius: 19,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.primary.main,
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
    color: Colors.neutral.surface,
  },

  generateArrow: {
    width: 42,
    height: 42,
    marginLeft: 4,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary.dark,
  },

  audioCard: {
    marginTop: 20,
    padding: 20,
    borderRadius: 24,
    backgroundColor: Colors.neutral.surface,
    borderWidth: 2,
    borderColor: Colors.primary.light,
  },

  readyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.feedback.correctSurface,
  },

  readyBadgeText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 12,
    color: Colors.feedback.correctText,
  },

  audioHeader: {
    marginTop: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  audioTitleContainer: {
    flex: 1,
  },

  audioTitle: {
    fontFamily: Typography.fonts.bold,
    fontSize: 21,
    color: Colors.neutral.textDark,
  },

  audioSubtitle: {
    marginTop: 3,
    fontFamily: Typography.fonts.regular,
    fontSize: 14,
    color: Colors.neutral.textMuted,
  },

  audioIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary.surface,
  },

  wordPreview: {
    marginTop: 16,
    padding: 14,
    borderRadius: 14,
    backgroundColor: Colors.neutral.background,
  },

  wordPreviewText: {
    fontFamily: Typography.fonts.semibold,
    fontSize: 16,
    color: Colors.neutral.textDark,
  },

  player: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },

  playButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary.main,
  },

  progressContainer: {
    flex: 1,
    marginLeft: 14,
  },

  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: Colors.neutral.border,
  },

  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: Colors.primary.main,
  },

  timeRow: {
    marginTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  timeText: {
    fontFamily: Typography.fonts.regular,
    fontSize: 12,
    color: Colors.neutral.textMuted,
  },

  regenerateButton: {
    marginTop: 18,
    minHeight: 46,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    backgroundColor: Colors.primary.surface,
  },

  regenerateText: {
    fontFamily: Typography.fonts.semibold,
    fontSize: 15,
    color: Colors.primary.dark,
  },

  infoCard: {
    marginTop: 20,
    padding: 15,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent.amberSurface,
  },

  infoIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.neutral.surface,
  },

  infoContent: {
    flex: 1,
    marginLeft: 10,
  },

  infoTitle: {
    fontFamily: Typography.fonts.bold,
    fontSize: 13,
    color: Colors.accent.amberDark,
  },

  infoText: {
    marginTop: 2,
    fontFamily: Typography.fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    color: Colors.neutral.textMuted,
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