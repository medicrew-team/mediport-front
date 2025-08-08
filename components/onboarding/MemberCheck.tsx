import { router } from 'expo-router';
import React from 'react';
import {
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useOnboarding } from '../../contexts/OnboardingContext';

export default function MemberCheck() {
  const { setCurrentStep } = useOnboarding();

  const handleYes = () => {
    router.push('/login');
  };

  const handleNo = () => {
    // 신규 회원이면 회원가입 프로세스 시작
    setCurrentStep('basic-info');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>👋</Text>
        </View>
        
        <Text style={styles.title}>안녕하세요!</Text>
        <Text style={styles.subtitle}>
          이미 저희 서비스의{'\n'}
          회원이신가요?
        </Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.yesButton]}
            onPress={handleYes}
          >
            <Text style={styles.yesButtonText}>네, 회원이에요</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.noButton]}
            onPress={handleNo}
          >
            <Text style={styles.noButtonText}>아니요, 처음이에요</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 32,
  },
  icon: {
    fontSize: 64,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 48,
    color: '#666',
    lineHeight: 26,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  button: {
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  yesButton: {
    backgroundColor: '#007AFF',
  },
  noButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  yesButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  noButtonText: {
    color: '#007AFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});