import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Alert,
} from 'react-native';
import { t } from 'i18next';

interface LoginFormProps {
  onLogin: (email: string, password: string) => void;
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !email.trim()) {
      Alert.alert(t('onboarding.alert.error'), t('onboarding.alert.email?'));
      return;
    }
    if (!password) {
      Alert.alert(t('onboarding.alert.error'), t('onboarding.alert.password?'));
      return;
    }

    setIsLoading(true);
    try {
      await onLogin(email, password);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToOnboarding = () => {
    // 온보딩 페이지로 돌아가기
    router.replace('/onboarding');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            {/* 뒤로가기 버튼 */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackToOnboarding}
            >
              <Text style={styles.backButtonText}>{t('onboarding.login.back')}</Text>
            </TouchableOpacity>

            <View style={styles.content}>
              <Text style={styles.title}>{t('onboarding.login.title')}</Text>
              <Text style={styles.subtitle}>{t('onboarding.login.subtitle')}</Text>

              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t('onboarding.login.email')}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={t('onboarding.login.emailplaceholder')}
                    placeholderTextColor="#999"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t('onboarding.login.password')}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={t('onboarding.login.passwordplaceholder')}
                    placeholderTextColor="#999"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                </View>

                <TouchableOpacity
                  style={[
                    styles.loginButton,
                    isLoading && styles.disabledButton
                  ]}
                  onPress={handleLogin}
                >
                  <Text style={[
                    styles.loginButtonText,
                    isLoading && styles.disabledButtonText
                  ]}>
                    {isLoading ? t('onboarding.login.loadingLogin') : t('onboarding.login.LoginBTN')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFCF9',
  },
  container: {
    flex: 1,
  },
  backButton: {
    padding: 16,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 16,
    color: '#ff6600',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    color: '#666',
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  loginButton: {
    backgroundColor: '#ff6600',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  disabledButtonText: {
    color: '#999',
  },
  forgotPasswordButton: {
    marginTop: 16,
    padding: 8,
  },
  forgotPasswordText: {
    color: '#ff6600',
    fontSize: 16,
    textAlign: 'center',
  },
});
