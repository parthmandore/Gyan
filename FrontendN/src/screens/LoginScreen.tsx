/**
 * Purpose: Gyan authentication screen with app and learning language selection.
 * Module: Screens
 * Folder: frontend/src/screens
 */

import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RootStackParamList } from '../types';

import {
  AppLanguage,
  LearningLanguage,
  useAppLanguageStore,
} from '../state/appLanguageStore';

import { authService } from '../services/authService';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'Login'
>;

const LANGUAGES: {
  code: AppLanguage;
  name: string;
  native: string;
}[] = [
  {
    code: 'en',
    name: 'English',
    native: 'English',
  },
  {
    code: 'hi',
    name: 'Hindi',
    native: 'हिन्दी',
  },
  {
    code: 'mr',
    name: 'Marathi',
    native: 'मराठी',
  },
];

const COPY = {
  en: {
    student: 'Student',
    parent: 'Parent',
    teacher: 'Teacher',

    welcome: 'Welcome to Gyan!',
    subtitle: 'Learn • Play • Grow',
    journey: "Let's start your learning journey",

    appLanguage: 'App Language',
    appLanguageHint:
      'Choose the language you want to use Gyan in.',

    learningLanguage: 'Language to Learn',
    learningLanguageHint:
      'Choose the language you want to learn.',

    loginTitle: 'Login to continue',
    loginHint:
      'Enter your details to access your Gyan account.',

    email: 'Email Address',
    emailPlaceholder: 'Enter your email',

    password: 'Password',
    passwordPlaceholder: 'Enter your password',

    login: 'Login',
    loggingIn: 'Logging in...',

    required:
      'Please enter your email and password.',

    invalidEmail:
      'Please enter a valid email address.',

    loginFailed:
      'Login failed. Please check your credentials.',

    roleMismatch:
      'This account does not belong to the selected role.',

    networkError:
      'Unable to connect to Gyan. Please try again.',

    learningRequired:
      'Please select a language to learn.',
  },

  hi: {
    student: 'विद्यार्थी',
    parent: 'अभिभावक',
    teacher: 'शिक्षक',

    welcome: 'Gyan में आपका स्वागत है!',
    subtitle: 'सीखें • खेलें • आगे बढ़ें',
    journey: 'आइए सीखने की यात्रा शुरू करें',

    appLanguage: 'ऐप की भाषा',
    appLanguageHint:
      'Gyan को किस भाषा में उपयोग करना है चुनें।',

    learningLanguage: 'सीखने की भाषा',
    learningLanguageHint:
      'वह भाषा चुनें जिसे आप सीखना चाहते हैं।',

    loginTitle: 'जारी रखने के लिए लॉगिन करें',
    loginHint:
      'अपने Gyan अकाउंट की जानकारी दर्ज करें।',

    email: 'ईमेल पता',
    emailPlaceholder: 'अपना ईमेल दर्ज करें',

    password: 'पासवर्ड',
    passwordPlaceholder: 'अपना पासवर्ड दर्ज करें',

    login: 'लॉगिन',
    loggingIn: 'लॉगिन हो रहा है...',

    required:
      'कृपया अपना ईमेल और पासवर्ड दर्ज करें।',

    invalidEmail:
      'कृपया सही ईमेल पता दर्ज करें।',

    loginFailed:
      'लॉगिन असफल हुआ। कृपया अपनी जानकारी जाँचें।',

    roleMismatch:
      'यह अकाउंट चुनी गई भूमिका से मेल नहीं खाता।',

    networkError:
      'Gyan से कनेक्ट नहीं हो पा रहा है। कृपया दोबारा प्रयास करें।',

    learningRequired:
      'कृपया सीखने के लिए एक भाषा चुनें।',
  },

  mr: {
    student: 'विद्यार्थी',
    parent: 'पालक',
    teacher: 'शिक्षक',

    welcome: 'Gyan मध्ये तुमचे स्वागत आहे!',
    subtitle: 'शिका • खेळा • प्रगती करा',
    journey: 'चला तुमची शिकण्याची यात्रा सुरू करूया',

    appLanguage: 'अॅपची भाषा',
    appLanguageHint:
      'Gyan कोणत्या भाषेत वापरायचे ते निवडा.',

    learningLanguage: 'शिकण्याची भाषा',
    learningLanguageHint:
      'तुम्हाला शिकायची भाषा निवडा.',

    loginTitle: 'पुढे जाण्यासाठी लॉगिन करा',
    loginHint:
      'तुमच्या Gyan अकाउंटची माहिती भरा.',

    email: 'ईमेल पत्ता',
    emailPlaceholder: 'तुमचा ईमेल लिहा',

    password: 'पासवर्ड',
    passwordPlaceholder: 'तुमचा पासवर्ड लिहा',

    login: 'लॉगिन',
    loggingIn: 'लॉगिन होत आहे...',

    required:
      'कृपया ईमेल आणि पासवर्ड लिहा.',

    invalidEmail:
      'कृपया योग्य ईमेल पत्ता लिहा.',

    loginFailed:
      'लॉगिन अयशस्वी झाले. कृपया माहिती तपासा.',

    roleMismatch:
      'हे अकाउंट निवडलेल्या भूमिकेशी जुळत नाही.',

    networkError:
      'Gyan शी कनेक्ट होता येत नाही. कृपया पुन्हा प्रयत्न करा.',

    learningRequired:
      'कृपया शिकण्यासाठी एक भाषा निवडा.',
  },
} as const;

const ROLE_LABEL_KEY = {
  student: 'student',
  parent: 'parent',
  teacher: 'teacher',
} as const;

export const LoginScreen: React.FC<Props> = ({
  navigation,
  route,
}) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const role = route.params.role;

  const selectedLanguage =
    useAppLanguageStore(
      (state) => state.selectedLanguage,
    );

  const selectedLearningLanguage =
    useAppLanguageStore(
      (state) => state.selectedLearningLanguage,
    );

  const setSelectedLanguage =
    useAppLanguageStore(
      (state) => state.setSelectedLanguage,
    );

  const setSelectedLearningLanguage =
    useAppLanguageStore(
      (state) => state.setSelectedLearningLanguage,
    );

  const [email, setEmail] = useState('');
  const [password, setPassword] =
    useState('');

  const [showPassword, setShowPassword] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  const currentLanguage: AppLanguage =
    selectedLanguage || 'en';

  const currentLearningLanguage:
    | LearningLanguage
    | null =
    selectedLearningLanguage;

  const copy = useMemo(
    () => COPY[currentLanguage],
    [currentLanguage],
  );

  const roleLabel = t(`roleSelection.${ROLE_LABEL_KEY[role]}`, {
    defaultValue: copy[ROLE_LABEL_KEY[role]],
  });

  const handleLanguageChange = async (
    language: AppLanguage,
  ) => {
    await setSelectedLanguage(language);
    setError('');
  };

  const handleLearningLanguageChange =
    async (
      language: LearningLanguage,
    ) => {
      await setSelectedLearningLanguage(
        language,
      );
      setError('');
    };

  const handleLogin = async () => {
    setError('');

    const trimmedEmail =
      email.trim().toLowerCase();

    if (!trimmedEmail || !password) {
      setError(copy.required);
      return;
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(trimmedEmail)) {
      setError(copy.invalidEmail);
      return;
    }

    if (!currentLearningLanguage) {
      setError(copy.learningRequired);
      return;
    }

    setIsLoading(true);

    try {
      const user =
        await authService.login(
          trimmedEmail,
          password,
        );

      if (user.role !== role) {
        await authService.logout();
        setError(copy.roleMismatch);
        return;
      }

      if (user.role === 'student') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
        return;
      }

      if (user.role === 'parent') {
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'ParentDashboard',
            },
          ],
        });
        return;
      }

      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'TeacherDashboard',
          },
        ],
      });
    } catch (err: any) {
      console.log(
        '[LoginScreen] Login error:',
        err,
      );

      if (
        !err?.response &&
        err?.message === 'Network Error'
      ) {
        setError(copy.networkError);
      } else {
        setError(
          err?.response?.data?.message ||
            copy.loginFailed,
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >
      <View
        style={[
          styles.screen,
          {
            paddingTop: insets.top + 6,
            paddingBottom: Math.max(
              insets.bottom,
              5,
            ),
          },
        ]}
      >
        {/* DECORATIVE LEAVES */}

        <View
          style={[
            styles.leafDecoration,
            styles.leafLeft,
          ]}
        >
          <View style={styles.leafStem} />
          <View style={styles.leafOne} />
          <View style={styles.leafTwo} />
        </View>

        <View
          style={[
            styles.leafDecoration,
            styles.leafRight,
          ]}
        >
          <View style={styles.leafStem} />
          <View style={styles.leafOne} />
          <View style={styles.leafTwo} />
        </View>

        {/* TOP BAR */}

        <View style={styles.topBar}>
          <Pressable
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressed,
            ]}
            onPress={() =>
              navigation.goBack()
            }
          >
            <Ionicons
              name="arrow-back"
              size={21}
              color="#173B5E"
            />
          </Pressable>

          <View style={styles.roleBadge}>
            <Ionicons
              name="person"
              size={13}
              color="#6655D8"
            />

            <Text
              style={styles.roleBadgeText}
            >
              {roleLabel}
            </Text>
          </View>
        </View>

        {/* BRANDING */}

        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoLeaf}>
              🌱
            </Text>
          </View>

          <Text style={styles.brandName}>
            Gyan
          </Text>

          <Text style={styles.title}>
            {copy.welcome}
          </Text>

          <Text style={styles.subtitle}>
            {copy.subtitle}
          </Text>

          <View style={styles.journeyPill}>
            <Text style={styles.journeyIcon}>
              ✨
            </Text>

            <Text style={styles.journeyText}>
              {copy.journey}
            </Text>
          </View>
        </View>

        {/* APP LANGUAGE CARD */}

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Ionicons
                name="globe-outline"
                size={19}
                color="#21A873"
              />
            </View>

            <View style={styles.sectionHeaderText}>
              <Text
                style={styles.sectionTitle}
              >
                {copy.appLanguage}
              </Text>

              <Text
                style={styles.sectionHint}
              >
                {copy.appLanguageHint}
              </Text>
            </View>
          </View>

          <View style={styles.languageRow}>
            {LANGUAGES.map((language) => {
              const selected =
                currentLanguage ===
                language.code;

              return (
                <Pressable
                  key={language.code}
                  style={[
                    styles.languageCard,
                    selected &&
                      styles.languageCardSelected,
                  ]}
                  onPress={() =>
                    handleLanguageChange(
                      language.code,
                    )
                  }
                >
                  <Text
                    style={[
                      styles.languageNative,
                      selected &&
                        styles.selectedText,
                    ]}
                  >
                    {language.native}
                  </Text>

                  <Text
                    style={[
                      styles.languageName,
                      selected &&
                        styles.selectedSubText,
                    ]}
                  >
                    {language.name}
                  </Text>

                  {selected && (
                    <View
                      style={
                        styles.checkCircle
                      }
                    >
                      <Ionicons
                        name="checkmark"
                        size={11}
                        color="#FFFFFF"
                      />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* LEARNING LANGUAGE CARD */}

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Ionicons
                name="book-outline"
                size={19}
                color="#21A873"
              />
            </View>

            <View style={styles.sectionHeaderText}>
              <Text
                style={styles.sectionTitle}
              >
                {copy.learningLanguage}
              </Text>

              <Text
                style={styles.sectionHint}
              >
                {copy.learningLanguageHint}
              </Text>
            </View>
          </View>

          <View style={styles.learningRow}>
            {LANGUAGES.map((language) => {
              const selected =
                currentLearningLanguage ===
                language.code;

              return (
                <Pressable
                  key={`learn-${language.code}`}
                  style={[
                    styles.learningCard,
                    selected &&
                      styles.learningCardSelected,
                  ]}
                  onPress={() =>
                    handleLearningLanguageChange(
                      language.code as LearningLanguage,
                    )
                  }
                >
                  <View>
                    <Text
                      style={[
                        styles.learningNative,
                        selected &&
                          styles.learningSelectedText,
                      ]}
                    >
                      {language.native}
                    </Text>

                    <Text
                      style={
                        styles.learningName
                      }
                    >
                      {language.name}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.radio,
                      selected &&
                        styles.radioSelected,
                    ]}
                  >
                    {selected && (
                      <View
                        style={styles.radioDot}
                      />
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* LOGIN CARD */}

        <View style={styles.loginCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Ionicons
                name="lock-closed-outline"
                size={19}
                color="#21A873"
              />
            </View>

            <View style={styles.sectionHeaderText}>
              <Text
                style={styles.sectionTitle}
              >
                {copy.loginTitle}
              </Text>

              <Text
                style={styles.sectionHint}
              >
                {copy.loginHint}
              </Text>
            </View>
          </View>

          {/* EMAIL */}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              {copy.email}
            </Text>

            <View
              style={styles.inputContainer}
            >
              <Ionicons
                name="mail-outline"
                size={18}
                color="#7893A5"
              />

              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder={
                  copy.emailPlaceholder
                }
                placeholderTextColor="#9AAEBB"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
                style={styles.input}
              />
            </View>
          </View>

          {/* PASSWORD */}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              {copy.password}
            </Text>

            <View
              style={styles.inputContainer}
            >
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color="#7893A5"
              />

              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder={
                  copy.passwordPlaceholder
                }
                placeholderTextColor="#9AAEBB"
                secureTextEntry={
                  !showPassword
                }
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
                style={styles.input}
              />

              <Pressable
                onPress={() =>
                  setShowPassword(
                    (previous) =>
                      !previous,
                  )
                }
                hitSlop={10}
              >
                <Ionicons
                  name={
                    showPassword
                      ? 'eye-off-outline'
                      : 'eye-outline'
                  }
                  size={20}
                  color="#7893A5"
                />
              </Pressable>
            </View>
          </View>

          {/* ERROR */}

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons
                name="alert-circle"
                size={17}
                color="#C0392B"
              />

              <Text style={styles.errorText}>
                {error}
              </Text>
            </View>
          ) : null}

          {/* LOGIN BUTTON */}

          <Pressable
            style={({ pressed }) => [
              styles.loginButton,
              pressed &&
                !isLoading &&
                styles.loginButtonPressed,
              isLoading &&
                styles.loginButtonDisabled,
            ]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <ActivityIndicator
                  color="#FFFFFF"
                  size="small"
                />

                <Text
                  style={styles.loginButtonText}
                >
                  {copy.loggingIn}
                </Text>
              </>
            ) : (
              <>
                <Text
                  style={styles.loginButtonText}
                >
                  {copy.login}
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color="#FFFFFF"
                />
              </>
            )}
          </Pressable>

          {/* SECURITY STRIP */}

          <View style={styles.securityStrip}>
            <Ionicons
              name="shield-checkmark"
              size={17}
              color="#24956E"
            />

            <Text style={styles.securityText}>
              Safe • Secure • For a brighter
              learning future
            </Text>
          </View>
        </View>

        {/* FOOTER */}

        <Text style={styles.footerText}>
          Gyan • Learn • Play • Grow
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1FBFB',
  },

  screen: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },

  /* ---------------- TOP BAR ---------------- */

  topBar: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#DCE8EC',
    shadowColor: '#173B5E',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },

  roleBadge: {
    minHeight: 31,
    paddingHorizontal: 10,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0EDFF',
  },

  roleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6655D8',
  },

  /* ---------------- HEADER ---------------- */

  header: {
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 7,
  },

  logoCircle: {
    width: 57,
    height: 57,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F8F2',
    borderWidth: 2,
    borderColor: '#52CFA5',
    shadowColor: '#21A873',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 1,
  },

  logoLeaf: {
    fontSize: 27,
  },

  brandName: {
    marginTop: 2,
    fontSize: 15,
    fontWeight: '800',
    color: '#6655D8',
  },

  title: {
    marginTop: 1,
    fontSize: 21,
    lineHeight: 26,
    fontWeight: '800',
    color: '#173B5E',
  },

  subtitle: {
    marginTop: 1,
    fontSize: 10,
    color: '#6D8799',
  },

  journeyPill: {
    marginTop: 6,
    paddingHorizontal: 13,
    height: 31,
    borderRadius: 17,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1EDFF',
  },

  journeyIcon: {
    fontSize: 13,
  },

  journeyText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6655D8',
  },

  /* ---------------- DECORATION ---------------- */

  leafDecoration: {
    position: 'absolute',
    width: 75,
    height: 130,
    opacity: 0.18,
    pointerEvents: 'none',
  },

  leafLeft: {
    left: -34,
    top: 135,
  },

  leafRight: {
    right: -34,
    top: 150,
    transform: [{ scaleX: -1 }],
  },

  leafStem: {
    position: 'absolute',
    left: 36,
    top: 12,
    width: 3,
    height: 115,
    borderRadius: 2,
    backgroundColor: '#4CC9A0',
    transform: [{ rotate: '-12deg' }],
  },

  leafOne: {
    position: 'absolute',
    left: 20,
    top: 25,
    width: 34,
    height: 18,
    borderTopLeftRadius: 28,
    borderBottomRightRadius: 28,
    backgroundColor: '#65D5AF',
    transform: [{ rotate: '-28deg' }],
  },

  leafTwo: {
    position: 'absolute',
    left: 34,
    top: 57,
    width: 35,
    height: 18,
    borderTopLeftRadius: 28,
    borderBottomRightRadius: 28,
    backgroundColor: '#65D5AF',
    transform: [{ rotate: '-8deg' }],
  },

  /* ---------------- CARDS ---------------- */

  card: {
    marginBottom: 7,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: '#FFFDFC',
    borderWidth: 1.5,
    borderColor: '#E0EAED',
    shadowColor: '#173B5E',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.06,
    shadowRadius: 7,
    elevation: 2,
  },

  loginCard: {
    marginBottom: 5,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: '#FFFDFC',
    borderWidth: 1.5,
    borderColor: '#E0EAED',
    shadowColor: '#173B5E',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.06,
    shadowRadius: 7,
    elevation: 2,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
    backgroundColor: '#E7F8F1',
  },

  sectionHeaderText: {
    flex: 1,
  },

  sectionTitle: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '800',
    color: '#173B5E',
  },

  sectionHint: {
    marginTop: 1,
    fontSize: 8.5,
    lineHeight: 12,
    color: '#7892A2',
  },

  /* ---------------- APP LANGUAGES ---------------- */

  languageRow: {
    flexDirection: 'row',
    gap: 7,
    marginTop: 8,
  },

  languageCard: {
    flex: 1,
    height: 58,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFB',
    borderWidth: 1.5,
    borderColor: '#DEE8EC',
  },

  languageCardSelected: {
    backgroundColor: '#F1EEFF',
    borderColor: '#8B7CF6',
  },

  languageNative: {
    fontSize: 13,
    fontWeight: '800',
    color: '#173B5E',
  },

  languageName: {
    marginTop: 1,
    fontSize: 8,
    color: '#7D96A6',
  },

  selectedText: {
    color: '#173B5E',
  },

  selectedSubText: {
    color: '#6655D8',
    fontWeight: '700',
  },

  checkCircle: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6655D8',
  },

  /* ---------------- LEARNING LANGUAGES ---------------- */

  learningRow: {
    flexDirection: 'row',
    gap: 7,
    marginTop: 8,
  },

  learningCard: {
    flex: 1,
    minHeight: 48,
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFB',
    borderWidth: 1.5,
    borderColor: '#DEE8EC',
  },

  learningCardSelected: {
    backgroundColor: '#E9FAF3',
    borderColor: '#49C99A',
  },

  learningNative: {
    fontSize: 12,
    fontWeight: '800',
    color: '#173B5E',
  },

  learningName: {
    marginTop: 1,
    fontSize: 7.5,
    color: '#7892A2',
  },

  learningSelectedText: {
    color: '#175E48',
  },

  radio: {
    width: 21,
    height: 21,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#C7D6DE',
  },

  radioSelected: {
    borderColor: '#26956E',
  },

  radioDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#26956E',
  },

  /* ---------------- LOGIN ---------------- */

  inputGroup: {
    marginTop: 7,
  },

  inputLabel: {
    marginBottom: 4,
    fontSize: 9,
    fontWeight: '800',
    color: '#173B5E',
  },

  inputContainer: {
    height: 42,
    paddingHorizontal: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: '#F8FAFB',
    borderWidth: 1.5,
    borderColor: '#DCE8EC',
  },

  input: {
    flex: 1,
    height: 40,
    paddingVertical: 0,
    fontSize: 11,
    color: '#173B5E',
  },

  errorBox: {
    marginTop: 7,
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF1EF',
    borderWidth: 1,
    borderColor: '#F4C7C1',
  },

  errorText: {
    flex: 1,
    fontSize: 8.5,
    lineHeight: 12,
    color: '#A93226',
  },

  loginButton: {
    height: 44,
    marginTop: 8,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#8878F4',
    shadowColor: '#6655D8',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.14,
    shadowRadius: 5,
    elevation: 2,
  },

  loginButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
  },

  loginButtonDisabled: {
    opacity: 0.65,
  },

  loginButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  securityStrip: {
    height: 31,
    marginTop: 7,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#E8F8F1',
  },

  securityText: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#24956E',
  },

  /* ---------------- FOOTER ---------------- */

  footerText: {
    textAlign: 'center',
    paddingVertical: 2,
    fontSize: 7.5,
    color: '#8AA2B0',
  },

  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
});

export default LoginScreen;