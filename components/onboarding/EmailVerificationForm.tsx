import React, { useEffect, useState } from 'react';
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { t } from 'i18next';

export default function EmailVerificationForm() {
  const { data, updateData, nextStep, previousStep } = useOnboarding();
  const [email, setEmail] = useState(data.email);
  const [verificationCode, setVerificationCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(0); // Mock countdown for resend

  useEffect(() => {
    let timer: number; // NodeJS.Timeout 대신 number로 변경
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendCode = async () => {
    if (!email.trim()) {
      Alert.alert(t('onboarding.alert.title'), t('onboarding.alert.email?'));
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert(t('onboarding.alert.error'), t('onboarding.alert.emailRegex?'));
      return;
    }

    // Mock: 실제 이메일 전송 로직은 여기에 구현
    Alert.alert(t('onboarding.alert.title'), `${email} ${t('onboarding.alert.emailsend?')}`);
    setIsCodeSent(true);
    setCountdown(10); // 10초 카운트다운 시작
    updateData({ email: email.trim() }); // 이메일 데이터 업데이트
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      Alert.alert(t('onboarding.alert.title'), t('onboarding.alert.emailcode?'));
      return;
    }
    setIsVerifying(true);
    // Mock: 실제 인증 로직은 여기에 구현
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call

    if (verificationCode === '123456') { // Mock code
      Alert.alert(t('onboarding.alert.success'), t('onboarding.alert.emailverified?'));
      updateData({ emailVerified: true });
      nextStep();
    } else {
      Alert.alert(t('onboarding.alert.error'), t('onboarding.alert.emailcodeinvalid?'));
    }
    setIsVerifying(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 20 }}
        enableOnAndroid={true}
        extraScrollHeight={50}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={previousStep} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{t('onboarding.emailVerification.title')}</Text>
          <Text style={styles.subtitle}>
            {t('onboarding.emailVerification.subtitle')}
          </Text>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('onboarding.emailVerification.email')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('onboarding.emailVerification.emailplaceholder')}
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isCodeSent} // 코드 전송 후에는 이메일 수정 불가
              />
              <TouchableOpacity
                style={[
                  styles.sendCodeButton,
                  (!email.trim() || isCodeSent || countdown > 0) && styles.disabledButton
                ]}
                onPress={handleSendCode}
                disabled={!email.trim() || isCodeSent || countdown > 0}
              >
                <Text style={styles.sendCodeButtonText}>
                  {isCodeSent ? (countdown > 0 ? `${countdown}${t('onboarding.emailVerification.sendCodeCountdown')}` : t('onboarding.emailVerification.sendCodeResend')) : t('onboarding.emailVerification.sendCode')}
                </Text>
              </TouchableOpacity>
            </View>

            {isCodeSent && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('onboarding.emailVerification.verificationCode')}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={t('onboarding.emailVerification.verificationCodeplaceholder')}
                  placeholderTextColor="#999"
                  value={verificationCode}
                  onChangeText={setVerificationCode}
                  keyboardType="number-pad"
                  maxLength={6}
                />
                <TouchableOpacity
                  style={[
                    styles.verifyButton,
                    (!verificationCode.trim() || isVerifying) && styles.disabledButton
                  ]}
                  onPress={handleVerifyCode}
                  disabled={!verificationCode.trim() || isVerifying}
                >
                  <Text style={styles.verifyButtonText}>
                    {isVerifying ? t('onboarding.emailVerification.loadingVerify') : t('onboarding.emailVerification.onVerify')}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFCF9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: '#FF6600',
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
    color: '#666',
  },
  form: {
    marginBottom: 32,
  },
  inputGroup: {
    marginTop: 20,
    marginBottom: 40,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
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
  sendCodeButton: {
    backgroundColor: '#FF6600',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  sendCodeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  verifyButton: {
    backgroundColor: '#FF6600',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
});
