/**
 * Purpose: Role selection screen for Student, Parent and Teacher users.
 * Module: Screens
 * Folder: frontend/src/screens
 */

import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'RoleSelection'
>;

export const RoleSelectionScreen: React.FC<Props> = ({
  navigation,
}) => {
  const handleBack = () => {
    navigation.replace('LanguageGate');
  };

  const handleStudent = () => {
    navigation.navigate('Home');
  };

  const handleParent = () => {
    navigation.navigate('ParentDashboard');
  };

  const handleTeacher = () => {
    navigation.navigate('TeacherDashboard');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* TOP BAR */}

        <View style={styles.topBar}>
          <Pressable
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressed,
            ]}
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel="Go back to language selection"
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color="#173B5E"
            />
          </Pressable>

          <Text style={styles.topBarTitle}>
            Choose Role
          </Text>

          <View style={styles.topBarSpacer} />
        </View>

        {/* HEADER */}

        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>
              🌱
            </Text>
          </View>

          <Text style={styles.brandName}>
            LingoBloom
          </Text>

          <Text style={styles.title}>
            Who are you?
          </Text>

          <Text style={styles.subtitle}>
            Choose your role to continue your learning journey.
          </Text>
        </View>

        {/* STUDENT */}

        <Pressable
          style={({ pressed }) => [
            styles.roleCard,
            styles.studentCard,
            pressed && styles.pressed,
          ]}
          onPress={handleStudent}
          accessibilityRole="button"
          accessibilityLabel="Continue as Student"
        >
          <View
            style={[
              styles.iconContainer,
              styles.studentIcon,
            ]}
          >
            <Text style={styles.roleEmoji}>
              👧
            </Text>
          </View>

          <View style={styles.roleContent}>
            <Text style={styles.roleTitle}>
              Student
            </Text>

            <Text style={styles.roleDescription}>
              Learn, practise, play and grow your skills.
            </Text>

            <View style={styles.roleTag}>
              <Ionicons
                name="sparkles"
                size={12}
                color="#6655D8"
              />

              <Text style={styles.roleTagText}>
                Learning & Games
              </Text>
            </View>
          </View>

          <View style={styles.arrow}>
            <Ionicons
              name="arrow-forward"
              size={20}
              color="#6655D8"
            />
          </View>
        </Pressable>

        {/* PARENT */}

        <Pressable
          style={({ pressed }) => [
            styles.roleCard,
            styles.parentCard,
            pressed && styles.pressed,
          ]}
          onPress={handleParent}
          accessibilityRole="button"
          accessibilityLabel="Continue as Parent"
        >
          <View
            style={[
              styles.iconContainer,
              styles.parentIcon,
            ]}
          >
            <Text style={styles.roleEmoji}>
              👨‍👩‍👧
            </Text>
          </View>

          <View style={styles.roleContent}>
            <Text style={styles.roleTitle}>
              Parent
            </Text>

            <Text style={styles.roleDescription}>
              Track your child's progress and celebrate
              their learning.
            </Text>

            <View
              style={[
                styles.roleTag,
                styles.parentTag,
              ]}
            >
              <Ionicons
                name="analytics"
                size={12}
                color="#217A5D"
              />

              <Text
                style={[
                  styles.roleTagText,
                  styles.parentTagText,
                ]}
              >
                Progress Dashboard
              </Text>
            </View>
          </View>

          <View style={styles.arrow}>
            <Ionicons
              name="arrow-forward"
              size={20}
              color="#6655D8"
            />
          </View>
        </Pressable>

        {/* TEACHER */}

        <Pressable
          style={({ pressed }) => [
            styles.roleCard,
            styles.teacherCard,
            pressed && styles.pressed,
          ]}
          onPress={handleTeacher}
          accessibilityRole="button"
          accessibilityLabel="Continue as Teacher"
        >
          <View
            style={[
              styles.iconContainer,
              styles.teacherIcon,
            ]}
          >
            <Text style={styles.roleEmoji}>
              👩‍🏫
            </Text>
          </View>

          <View style={styles.roleContent}>
            <Text style={styles.roleTitle}>
              Teacher
            </Text>

            <Text style={styles.roleDescription}>
              Manage your classroom and monitor student
              progress.
            </Text>

            <View
              style={[
                styles.roleTag,
                styles.teacherTag,
              ]}
            >
              <Ionicons
                name="school"
                size={12}
                color="#A85B00"
              />

              <Text
                style={[
                  styles.roleTagText,
                  styles.teacherTagText,
                ]}
              >
                Classroom Dashboard
              </Text>
            </View>
          </View>

          <View style={styles.arrow}>
            <Ionicons
              name="arrow-forward"
              size={20}
              color="#6655D8"
            />
          </View>
        </Pressable>

        {/* SECURITY / PRIVACY */}

        <View style={styles.footerCard}>
          <View style={styles.footerIcon}>
            <Ionicons
              name="shield-checkmark"
              size={19}
              color="#217A5D"
            />
          </View>

          <View style={styles.footerContent}>
            <Text style={styles.footerTitle}>
              Safe & personalized
            </Text>

            <Text style={styles.footerText}>
              Your role helps us show you the right
              LingoBloom experience.
            </Text>
          </View>
        </View>

        <Text style={styles.footerHint}>
          You can change your role later.
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1FBFB',
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 35,
  },

  /* TOP BAR */

  topBar: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFDFC',
    borderWidth: 1.5,
    borderColor: '#DCE8EC',
  },

  topBarTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#173B5E',
  },

  topBarSpacer: {
    width: 44,
  },

  /* HEADER */

  header: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 27,
  },

  logoCircle: {
    width: 74,
    height: 74,
    borderRadius: 37,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E5F8F0',
    borderWidth: 2,
    borderColor: '#55CFA3',
  },

  logoEmoji: {
    fontSize: 37,
  },

  brandName: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: '#6655D8',
  },

  title: {
    marginTop: 15,
    fontSize: 30,
    fontWeight: '800',
    color: '#173B5E',
  },

  subtitle: {
    maxWidth: 320,
    marginTop: 7,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 21,
    color: '#527087',
  },

  /* ROLE CARD */

  roleCard: {
    minHeight: 128,
    marginBottom: 15,
    padding: 15,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    backgroundColor: '#FFFDFC',

    shadowColor: '#173B5E',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  studentCard: {
    borderColor: '#C9C1FF',
  },

  parentCard: {
    borderColor: '#AEE8D0',
  },

  teacherCard: {
    borderColor: '#FFDDA0',
  },

  iconContainer: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
  },

  studentIcon: {
    backgroundColor: '#F0EDFF',
  },

  parentIcon: {
    backgroundColor: '#E5F8F0',
  },

  teacherIcon: {
    backgroundColor: '#FFF4C7',
  },

  roleEmoji: {
    fontSize: 31,
  },

  roleContent: {
    flex: 1,
    marginLeft: 14,
    marginRight: 8,
  },

  roleTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#173B5E',
  },

  roleDescription: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 17,
    color: '#527087',
  },

  roleTag: {
    alignSelf: 'flex-start',
    marginTop: 7,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0EDFF',
  },

  roleTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#6655D8',
  },

  parentTag: {
    backgroundColor: '#E5F8F0',
  },

  parentTagText: {
    color: '#217A5D',
  },

  teacherTag: {
    backgroundColor: '#FFF4C7',
  },

  teacherTagText: {
    color: '#A85B00',
  },

  arrow: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0EDFF',
  },

  /* FOOTER */

  footerCard: {
    marginTop: 8,
    padding: 14,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5F8F0',
    borderWidth: 1.5,
    borderColor: '#55CFA3',
  },

  footerIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFDFC',
  },

  footerContent: {
    flex: 1,
    marginLeft: 10,
  },

  footerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#217A5D',
  },

  footerText: {
    marginTop: 3,
    fontSize: 10,
    lineHeight: 15,
    color: '#527087',
  },

  footerHint: {
    marginTop: 13,
    textAlign: 'center',
    fontSize: 10,
    color: '#7C94A5',
  },

  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.985 }],
  },
});

export default RoleSelectionScreen;