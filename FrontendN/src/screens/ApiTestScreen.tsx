import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';

import { authService } from '../services/authService';

export const ApiTestScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const testLogin = async () => {
    setLoading(true);
    setResult('Connecting to backend...');

    try {
      const user = await authService.login(
        'teststudent@gmail.com',
        'Test@12345',
      );

      setResult(
        `LOGIN SUCCESS ✅\n\n` +
        `Name: ${user.name}\n` +
        `Email: ${user.email}\n` +
        `Role: ${user.role}\n` +
        `Age: ${user.age ?? 'N/A'}\n` +
        `Language: ${user.language ?? 'N/A'}\n` +
        `XP: ${user.xpTotal ?? 0}\n` +
        `Level: ${user.level ?? 1}\n` +
        `Streak: ${user.streak ?? 0}\n\n` +
        `JWT token received and stored ✅`,
      );
    } catch (error: any) {
      console.log('LOGIN API ERROR:', error);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Unknown error';

      setResult(
        `LOGIN FAILED ❌\n\n${message}\n\n` +
        `Status: ${error?.response?.status ?? 'No response'}`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Gyan API Test</Text>

      <Text style={styles.subtitle}>
        Testing frontend → backend login connection
      </Text>

      <Pressable
        style={styles.button}
        onPress={testLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>
            Test Login API
          </Text>
        )}
      </Pressable>

      {result ? (
        <View style={styles.resultBox}>
          <Text style={styles.resultText}>{result}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F1FBFB',
  },

  title: {
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666666',
    marginBottom: 32,
  },

  button: {
    minHeight: 56,
    borderRadius: 16,
    backgroundColor: '#8B7CF6',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },

  resultBox: {
    marginTop: 24,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },

  resultText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#222222',
  },
});

export default ApiTestScreen;