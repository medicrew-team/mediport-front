import React, { useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useOnboarding } from '../../contexts/OnboardingContext';

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
      Alert.alert('알림', '이메일을 입력해주세요.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('오류', '올바른 이메일 형식을 입력해주세요.');
      return;
    }

    // Mock: 실제 이메일 전송 로직은 여기에 구현
    Alert.alert('알림', `${email}으로 인증 코드를 전송했습니다.`);
    setIsCodeSent(true);
    setCountdown(10); // 10초 카운트다운 시작
    updateData({ email: email.trim() }); // 이메일 데이터 업데이트
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      Alert.alert('알림', '인증 코드를 입력해주세요.');
      return;
    }
    setIsVerifying(true);
    // Mock: 실제 인증 로직은 여기에 구현
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call

    if (verificationCode === '123456') { // Mock code
      Alert.alert('성공', '이메일이 인증되었습니다.');
      updateData({ emailVerified: true });
      nextStep();
    } else {
      Alert.alert('오류', '잘못된 인증 코드입니다.');
    }
    setIsVerifying(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity onPress={previousStep} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.stepText}>2/5</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>이메일 인증</Text>
          <Text style={styles.subtitle}>
            회원가입을 위해 이메일 주소를 인증해주세요.
          </Text>
          
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>이메일 *</Text>
              <TextInput
                style={styles.input}
                placeholder="이메일 주소를 입력해주세요"
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
                  {isCodeSent ? (countdown > 0 ? `${countdown}초 후 재전송` : '코드 재전송') : '인증 코드 전송'}
                </Text>
              </TouchableOpacity>
            </View>

            {isCodeSent && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>인증 코드 *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="전송된 6자리 코드를 입력해주세요"
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
                    {isVerifying ? '인증 중...' : '인증하기'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFCF9',
  },
  scrollView: {
    flex: 1,
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
  stepText: {
    fontSize: 16,
    color: '#666',
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
    marginBottom: 24,
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
