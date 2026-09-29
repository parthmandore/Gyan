/**
 * Purpose: Gyan role-based authentication screen.
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
  ScrollView,
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

const AGE_OPTIONS = [
  '5–6',
  '7–8',
  '9–10',
];

const ROLE_CONFIG = {
  student: {
    emoji: '👧',
    color: '#8878F4',
    lightColor: '#F0EDFF',
    title: 'Ready to learn?',
    subtitle: 'Your learning adventure starts here',
  },

  parent: {
    emoji: '👨‍👩‍👧',
    color: '#35B88A',
    lightColor: '#E8F8F1',
    title: 'Welcome back!',
    subtitle: "Let's support their learning journey",
  },

  teacher: {
    emoji: '👩‍🏫',
    color: '#5B8DEF',
    lightColor: '#EDF3FF',
    title: 'Welcome, teacher!',
    subtitle: "Let's make learning meaningful",
  },
} as const;

const COPY = {
  en: {
    student: 'Student',
    parent: 'Parent',
    teacher: 'Teacher',

    appLanguage: 'App Language',
    appLanguageHint:
      'Choose the language you want to use Gyan in.',

    learningLanguage: 'Language to Learn',
    learningLanguageHint:
      'Choose the language you want to learn.',

    age: 'Your Age',
    ageHint: 'Choose your age group.',

    loginTitle: 'Login to continue',
    loginHint:
      'Enter your details to access your Gyan account.',

    email: 'Email Address',
    emailPlaceholder: 'Enter your email',

    password: 'Password',
    passwordPlaceholder: 'Enter your password',

    login: 'Login',
    loggingIn: 'Logging in...',

    forgotPassword: 'Forgot password?',
    newToGyan: 'New to Gyan?',
    createAccount: 'Create account',

    learnPlayGrow: 'Learn • Play • Grow',

    studentTitle: 'Ready to learn?',
    studentSubtitle:
      'Your learning adventure starts here',

    parentTitle: 'Welcome back!',
    parentSubtitle:
      "Let's support their learning journey",

    teacherTitle: 'Welcome, teacher!',
    teacherSubtitle:
      "Let's make learning meaningful",

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

    ageRequired:
      'Please select your age group.',

    safeFooter:
      'Safe • Secure • Made for learning',
  },

  hi: {
    student: 'विद्यार्थी',
    parent: 'अभिभावक',
    teacher: 'शिक्षक',

    appLanguage: 'ऐप की भाषा',
    appLanguageHint:
      'Gyan को किस भाषा में उपयोग करना है चुनें।',

    learningLanguage: 'सीखने की भाषा',
    learningLanguageHint:
      'वह भाषा चुनें जिसे आप सीखना चाहते हैं।',

    age: 'आपकी उम्र',
    ageHint: 'अपना आयु वर्ग चुनें।',

    loginTitle:
      'जारी रखने के लिए लॉगिन करें',
    loginHint:
      'अपने Gyan अकाउंट की जानकारी दर्ज करें।',

    email: 'ईमेल पता',
    emailPlaceholder: 'अपना ईमेल दर्ज करें',

    password: 'पासवर्ड',
    passwordPlaceholder: 'अपना पासवर्ड दर्ज करें',

    login: 'लॉगिन',
    loggingIn: 'लॉगिन हो रहा है...',

    forgotPassword: 'पासवर्ड भूल गए?',
    newToGyan: 'Gyan पर नए हैं?',
    createAccount: 'अकाउंट बनाएं',

    learnPlayGrow: 'सीखें • खेलें • बढ़ें',

    studentTitle: 'सीखने के लिए तैयार?',
    studentSubtitle:
      'आपका सीखने का सफर यहाँ से शुरू होता है',

    parentTitle: 'वापसी पर स्वागत है!',
    parentSubtitle:
      'बच्चे की सीखने की यात्रा में साथ दें',

    teacherTitle: 'स्वागत है, शिक्षक!',
    teacherSubtitle:
      'सीखने को और भी बेहतर बनाएं',

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

    ageRequired:
      'कृपया अपनी आयु चुनें।',

    safeFooter:
      'सुरक्षित • सुरक्षित अनुभव • सीखने के लिए बनाया गया',
  },

  mr: {
    student: 'विद्यार्थी',
    parent: 'पालक',
    teacher: 'शिक्षक',

    appLanguage: 'अॅपची भाषा',
    appLanguageHint:
      'Gyan कोणत्या भाषेत वापरायचे ते निवडा.',

    learningLanguage: 'शिकण्याची भाषा',
    learningLanguageHint:
      'तुम्हाला शिकायची भाषा निवडा.',

    age: 'तुमचे वय',
    ageHint: 'तुमचा वयोगट निवडा.',

    loginTitle:
      'पुढे जाण्यासाठी लॉगिन करा',
    loginHint:
      'तुमच्या Gyan अकाउंटची माहिती भरा.',

    email: 'ईमेल पत्ता',
    emailPlaceholder: 'तुमचा ईमेल लिहा',

    password: 'पासवर्ड',
    passwordPlaceholder: 'तुमचा पासवर्ड लिहा',

    login: 'लॉगिन',
    loggingIn: 'लॉगिन होत आहे...',

    forgotPassword: 'पासवर्ड विसरलात?',
    newToGyan: 'Gyan वर नवीन आहात?',
    createAccount: 'अकाउंट तयार करा',

    learnPlayGrow: 'शिका • खेळा • वाढा',

    studentTitle: 'शिकण्यासाठी तयार?',
    studentSubtitle:
      'तुमचा शिकण्याचा प्रवास इथून सुरू होतो',

    parentTitle: 'पुन्हा स्वागत आहे!',
    parentSubtitle:
      'तुमच्या मुलाच्या शिकण्याच्या प्रवासाला साथ द्या',

    teacherTitle: 'स्वागत आहे, शिक्षक!',
    teacherSubtitle:
      'शिकणे अधिक अर्थपूर्ण बनवूया',

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

    ageRequired:
      'कृपया तुमचे वय निवडा.',

    safeFooter:
      'सुरक्षित • सुरक्षित अनुभव • शिकण्यासाठी तयार केलेले',
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

  const selectedLanguage = useAppLanguageStore(
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
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [showPassword, setShowPassword] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] = useState('');

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

  const roleLabel = t(
    `roleSelection.${ROLE_LABEL_KEY[role]}`,
    {
      defaultValue:
        copy[ROLE_LABEL_KEY[role]],
    },
  );

  const roleConfig = ROLE_CONFIG[role];

  const isStudent = role === 'student';

  const roleTitle =
    role === 'student'
      ? copy.studentTitle
      : role === 'parent'
        ? copy.parentTitle
        : copy.teacherTitle;

  const roleSubtitle =
    role === 'student'
      ? copy.studentSubtitle
      : role === 'parent'
        ? copy.parentSubtitle
        : copy.teacherSubtitle;

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

    if (
      isStudent &&
      !currentLearningLanguage
    ) {
      setError(copy.learningRequired);
      return;
    }

    if (isStudent && !age) {
      setError(copy.ageRequired);
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
          : 'height'
      }
      keyboardVerticalOffset={
        Platform.OS === 'ios'
          ? insets.top
          : 0
      }
    >
      <View
        style={[
          styles.screen,
          {
            paddingTop: insets.top + 5,
            paddingBottom: Math.max(
              insets.bottom,
              5,
            ),
          },
        ]}
      >
        {/* BACKGROUND DECORATION */}

        <View
          pointerEvents="none"
          style={[
            styles.backgroundCircle,
            styles.backgroundCircleOne,
            {
              backgroundColor:
                roleConfig.lightColor,
            },
          ]}
        />

        <View
          pointerEvents="none"
          style={[
            styles.backgroundCircle,
            styles.backgroundCircleTwo,
          ]}
        />

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

          <View
            style={[
              styles.roleBadge,
              {
                backgroundColor:
                  roleConfig.lightColor,
              },
            ]}
          >
            <Text style={styles.roleEmojiSmall}>
              {roleConfig.emoji}
            </Text>

            <Text
              style={[
                styles.roleBadgeText,
                {
                  color: roleConfig.color,
                },
              ]}
            >
              {roleLabel}
            </Text>
          </View>
        </View>

        {/* SCROLLABLE CONTENT */}

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingBottom:
                30 +
                Math.max(
                  insets.bottom,
                  5,
                ),
            },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={
            Platform.OS === 'ios'
              ? 'interactive'
              : 'on-drag'
          }
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          {/* HERO */}

          <View
            style={[
              styles.hero,
              !isStudent &&
                styles.nonStudentHero,
            ]}
          >
            <View
              style={[
                styles.heroEmojiCircle,
                {
                  backgroundColor:
                    roleConfig.lightColor,
                  borderColor:
                    roleConfig.color,
                },
              ]}
            >
              <Text style={styles.heroEmoji}>
                {roleConfig.emoji}
              </Text>
            </View>

            <Text style={styles.brandName}>
              Gyan
            </Text>

            <Text style={styles.heroTitle}>
              {roleTitle}
            </Text>

            <Text style={styles.heroSubtitle}>
              {roleSubtitle}
            </Text>

            <View
              style={[
                styles.funPill,
                {
                  backgroundColor:
                    roleConfig.lightColor,
                },
              ]}
            >
              <Text style={styles.funSparkle}>
                ✨
              </Text>

              <Text
                style={[
                  styles.funText,
                  {
                    color: roleConfig.color,
                  },
                ]}
              >
                {copy.learnPlayGrow}
              </Text>
            </View>
          </View>

          {/* MAIN CONTENT */}

          <View
            style={[
              styles.content,
              isStudent
                ? styles.studentContent
                : styles.nonStudentContent,
            ]}
          >
            {/* APP LANGUAGE */}

            <View style={styles.card}>
              <View style={styles.sectionHeader}>
                <View
                  style={[
                    styles.sectionIcon,
                    {
                      backgroundColor:
                        roleConfig.lightColor,
                    },
                  ]}
                >
                  <Ionicons
                    name="globe-outline"
                    size={18}
                    color={roleConfig.color}
                  />
                </View>

                <View
                  style={
                    styles.sectionHeaderText
                  }
                >
                  <Text
                    style={
                      styles.sectionTitle
                    }
                  >
                    {copy.appLanguage}
                  </Text>

                  <Text
                    style={
                      styles.sectionHint
                    }
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
                        selected && {
                          backgroundColor:
                            roleConfig.lightColor,
                          borderColor:
                            roleConfig.color,
                        },
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
                          selected && {
                            color:
                              roleConfig.color,
                          },
                        ]}
                      >
                        {language.native}
                      </Text>

                      <Text
                        style={
                          styles.languageName
                        }
                      >
                        {language.name}
                      </Text>

                      {selected && (
                        <View
                          style={[
                            styles.checkCircle,
                            {
                              backgroundColor:
                                roleConfig.color,
                            },
                          ]}
                        >
                          <Ionicons
                            name="checkmark"
                            size={10}
                            color="#FFFFFF"
                          />
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* STUDENT ONLY OPTIONS */}

            {isStudent && (
              <>
                {/* LEARNING LANGUAGE */}

                <View style={styles.card}>
                  <View
                    style={
                      styles.sectionHeader
                    }
                  >
                    <View
                      style={[
                        styles.sectionIcon,
                        {
                          backgroundColor:
                            '#E8F8F1',
                        },
                      ]}
                    >
                      <Ionicons
                        name="book-outline"
                        size={18}
                        color="#35B88A"
                      />
                    </View>

                    <View
                      style={
                        styles.sectionHeaderText
                      }
                    >
                      <Text
                        style={
                          styles.sectionTitle
                        }
                      >
                        {
                          copy.learningLanguage
                        }
                      </Text>

                      <Text
                        style={
                          styles.sectionHint
                        }
                      >
                        {
                          copy.learningLanguageHint
                        }
                      </Text>
                    </View>
                  </View>

                  <View
                    style={styles.learningRow}
                  >
                    {LANGUAGES.map(
                      (language) => {
                        const selected =
                          currentLearningLanguage ===
                          language.code;

                        return (
                          <Pressable
                            key={`learn-${language.code}`}
                            style={[
                              styles.learningCard,
                              selected && {
                                backgroundColor:
                                  '#E8F8F1',
                                borderColor:
                                  '#35B88A',
                              },
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
                                  selected && {
                                    color:
                                      '#238060',
                                  },
                                ]}
                              >
                                {
                                  language.native
                                }
                              </Text>

                              <Text
                                style={
                                  styles.learningName
                                }
                              >
                                {
                                  language.name
                                }
                              </Text>
                            </View>

                            <View
                              style={[
                                styles.radio,
                                selected && {
                                  borderColor:
                                    '#35B88A',
                                },
                              ]}
                            >
                              {selected && (
                                <View
                                  style={[
                                    styles.radioDot,
                                    {
                                      backgroundColor:
                                        '#35B88A',
                                    },
                                  ]}
                                />
                              )}
                            </View>
                          </Pressable>
                        );
                      },
                    )}
                  </View>
                </View>

                {/* AGE */}

                <View style={styles.card}>
                  <View
                    style={
                      styles.sectionHeader
                    }
                  >
                    <View
                      style={[
                        styles.sectionIcon,
                        {
                          backgroundColor:
                            '#F0EDFF',
                        },
                      ]}
                    >
                      <Ionicons
                        name="happy-outline"
                        size={18}
                        color="#8878F4"
                      />
                    </View>

                    <View
                      style={
                        styles.sectionHeaderText
                      }
                    >
                      <Text
                        style={
                          styles.sectionTitle
                        }
                      >
                        {copy.age}
                      </Text>

                      <Text
                        style={
                          styles.sectionHint
                        }
                      >
                        {copy.ageHint}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.ageRow}>
                    {AGE_OPTIONS.map(
                      (option) => {
                        const selected =
                          age === option;

                        return (
                          <Pressable
                            key={option}
                            style={[
                              styles.ageCard,
                              selected && {
                                backgroundColor:
                                  '#F0EDFF',
                                borderColor:
                                  '#8878F4',
                              },
                            ]}
                            onPress={() => {
                              setAge(option);
                              setError('');
                            }}
                          >
                            <Text
                              style={[
                                styles.ageText,
                                selected && {
                                  color:
                                    '#6655D8',
                                },
                              ]}
                            >
                              {option}
                            </Text>
                          </Pressable>
                        );
                      },
                    )}
                  </View>
                </View>
              </>
            )}

            {/* LOGIN */}

            <View style={styles.loginCard}>
              <View style={styles.sectionHeader}>
                <View
                  style={[
                    styles.sectionIcon,
                    {
                      backgroundColor:
                        roleConfig.lightColor,
                    },
                  ]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={18}
                    color={roleConfig.color}
                  />
                </View>

                <View
                  style={
                    styles.sectionHeaderText
                  }
                >
                  <Text
                    style={
                      styles.sectionTitle
                    }
                  >
                    {copy.loginTitle}
                  </Text>

                  <Text
                    style={
                      styles.sectionHint
                    }
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
                  style={[
                    styles.inputContainer,
                    {
                      borderColor:
                        email.length > 0
                          ? roleConfig.color
                          : '#DCE8EC',
                    },
                  ]}
                >
                  <Ionicons
                    name="mail-outline"
                    size={17}
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
                    returnKeyType="next"
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
                  style={[
                    styles.inputContainer,
                    {
                      borderColor:
                        password.length > 0
                          ? roleConfig.color
                          : '#DCE8EC',
                    },
                  ]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={17}
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
                    returnKeyType="done"
                    onSubmitEditing={
                      handleLogin
                    }
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

              {/* FORGOT PASSWORD */}

              <Pressable
                style={styles.forgotButton}
                onPress={() => {}}
              >
                <Text
                  style={[
                    styles.forgotText,
                    {
                      color:
                        roleConfig.color,
                    },
                  ]}
                >
                  {copy.forgotPassword}
                </Text>
              </Pressable>

              {/* ERROR */}

              {error ? (
                <View style={styles.errorBox}>
                  <Ionicons
                    name="alert-circle"
                    size={16}
                    color="#C0392B"
                  />

                  <Text
                    style={
                      styles.errorText
                    }
                  >
                    {error}
                  </Text>
                </View>
              ) : null}

              {/* LOGIN BUTTON */}

              <Pressable
                style={({ pressed }) => [
                  styles.loginButton,
                  {
                    backgroundColor:
                      roleConfig.color,
                  },
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
                      style={
                        styles.loginButtonText
                      }
                    >
                      {copy.loggingIn}
                    </Text>
                  </>
                ) : (
                  <>
                    <Text
                      style={
                        styles.loginButtonText
                      }
                    >
                      {copy.login}
                    </Text>

                    <View
                      style={styles.arrowCircle}
                    >
                      <Ionicons
                        name="arrow-forward"
                        size={16}
                        color={
                          roleConfig.color
                        }
                      />
                    </View>
                  </>
                )}
              </Pressable>

              {/* CREATE ACCOUNT */}

              <View style={styles.signupRow}>
                <Text
                  style={styles.signupNormal}
                >
                  {copy.newToGyan}
                </Text>

                <Pressable
                  onPress={() => {}}
                >
                  <Text
                    style={[
                      styles.signupLink,
                      {
                        color:
                          roleConfig.color,
                      },
                    ]}
                  >
                    {copy.createAccount}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* FOOTER */}

        <View
          style={[
            styles.footer,
            {
              bottom:
                Math.max(insets.bottom, 5),
            },
          ]}
        >
          <Ionicons
            name="shield-checkmark"
            size={13}
            color="#35B88A"
          />

          <Text style={styles.footerText}>
            {copy.safeFooter}
          </Text>
        </View>
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
    overflow: 'hidden',
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingTop: 4,
  },

  /* ---------------- BACKGROUND ---------------- */

  backgroundCircle: {
    position: 'absolute',
    borderRadius: 200,
    opacity: 0.55,
  },

  backgroundCircleOne: {
    width: 230,
    height: 230,
    right: -110,
    top: 105,
  },

  backgroundCircleTwo: {
    width: 135,
    height: 135,
    left: -88,
    bottom: 125,
    backgroundColor: '#E7F8F1',
  },

  /* ---------------- TOP BAR ---------------- */

  topBar: {
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backButton: {
    width: 43,
    height: 43,
    borderRadius: 22,
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
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 2,
  },

  roleBadge: {
    minHeight: 32,
    paddingHorizontal: 12,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  roleEmojiSmall: {
    fontSize: 15,
  },

  roleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },

  /* ---------------- HERO ---------------- */

  hero: {
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 9,
  },

  nonStudentHero: {
    marginTop: 10,
    marginBottom: 18,
  },

  heroEmojiCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },

  heroEmoji: {
    fontSize: 32,
  },

  brandName: {
    marginTop: 3,
    fontSize: 16,
    fontWeight: '800',
    color: '#6655D8',
  },

  heroTitle: {
    marginTop: 1,
    fontSize: 23,
    lineHeight: 27,
    fontWeight: '800',
    color: '#173B5E',
    textAlign: 'center',
  },

  heroSubtitle: {
    marginTop: 2,
    fontSize: 10,
    lineHeight: 13,
    color: '#7892A2',
    textAlign: 'center',
  },

  funPill: {
    height: 31,
    marginTop: 7,
    paddingHorizontal: 14,
    borderRadius: 17,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  funSparkle: {
    fontSize: 12,
  },

  funText: {
    fontSize: 9.5,
    fontWeight: '800',
  },

  /* ---------------- CONTENT ---------------- */

  content: {
    width: '100%',
  },

  studentContent: {
    gap: 10,
  },

  nonStudentContent: {
    gap: 12,
  },

  /* ---------------- CARDS ---------------- */

  card: {
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 18,
    backgroundColor: '#FFFDFC',
    borderWidth: 1.5,
    borderColor: '#E0EAED',
    shadowColor: '#173B5E',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.055,
    shadowRadius: 6,
    elevation: 2,
  },

  loginCard: {
    paddingHorizontal: 13,
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
    shadowOpacity: 0.055,
    shadowRadius: 6,
    elevation: 2,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  sectionIcon: {
    width: 35,
    height: 35,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  sectionHeaderText: {
    flex: 1,
  },

  sectionTitle: {
    fontSize: 14.5,
    lineHeight: 18,
    fontWeight: '800',
    color: '#173B5E',
  },

  sectionHint: {
    marginTop: 1,
    fontSize: 8,
    lineHeight: 11,
    color: '#7892A2',
  },

  /* ---------------- APP LANGUAGE ---------------- */

  languageRow: {
    flexDirection: 'row',
    gap: 7,
    marginTop: 8,
  },

  languageCard: {
    flex: 1,
    height: 55,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFB',
    borderWidth: 1.5,
    borderColor: '#DEE8EC',
  },

  languageNative: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#173B5E',
  },

  languageName: {
    marginTop: 1,
    fontSize: 7.5,
    color: '#7D96A6',
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
  },

  /* ---------------- LEARNING LANGUAGE ---------------- */

  learningRow: {
    flexDirection: 'row',
    gap: 7,
    marginTop: 7,
  },

  learningCard: {
    flex: 1,
    height: 46,
    paddingHorizontal: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFB',
    borderWidth: 1.5,
    borderColor: '#DEE8EC',
  },

  learningNative: {
    fontSize: 11,
    fontWeight: '800',
    color: '#173B5E',
  },

  learningName: {
    marginTop: 1,
    fontSize: 7,
    color: '#7892A2',
  },

  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#C7D6DE',
  },

  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  /* ---------------- AGE ---------------- */

  ageRow: {
    flexDirection: 'row',
    gap: 7,
    marginTop: 7,
  },

  ageCard: {
    flex: 1,
    height: 40,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFB',
    borderWidth: 1.5,
    borderColor: '#DEE8EC',
  },

  ageText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#35546D',
  },

  /* ---------------- LOGIN ---------------- */

  inputGroup: {
    marginTop: 6,
  },

  inputLabel: {
    marginBottom: 3,
    fontSize: 8.5,
    fontWeight: '800',
    color: '#173B5E',
  },

  inputContainer: {
    height: 40,
    paddingHorizontal: 10,
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: '#F8FAFB',
    borderWidth: 1.5,
  },

  input: {
    flex: 1,
    height: 38,
    paddingVertical: 0,
    fontSize: 10.5,
    color: '#173B5E',
  },

  forgotButton: {
    alignSelf: 'flex-end',
    marginTop: 4,
    paddingVertical: 1,
  },

  forgotText: {
    fontSize: 8.5,
    fontWeight: '800',
  },

  errorBox: {
    marginTop: 5,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFF1EF',
    borderWidth: 1,
    borderColor: '#F4C7C1',
  },

  errorText: {
    flex: 1,
    fontSize: 8,
    lineHeight: 11,
    color: '#A93226',
  },

  loginButton: {
    height: 43,
    marginTop: 7,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    shadowColor: '#173B5E',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.14,
    shadowRadius: 5,
    elevation: 2,
  },

  loginButtonPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.985 }],
  },

  loginButtonDisabled: {
    opacity: 0.65,
  },

  loginButtonText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  arrowCircle: {
    width: 25,
    height: 25,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },

  signupRow: {
    marginTop: 7,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },

  signupNormal: {
    fontSize: 9.5,
    color: '#8AA2B0',
  },

  signupLink: {
    fontSize: 10,
    fontWeight: '800',
  },

  /* ---------------- FOOTER ---------------- */

  footer: {
    position: 'absolute',
    left: 20,
    right: 20,
    height: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },

  footerText: {
    fontSize: 7.5,
    fontWeight: '700',
    color: '#8AA2B0',
  },

  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
});

export default LoginScreen;