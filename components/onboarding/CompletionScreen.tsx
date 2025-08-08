import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useOnboarding } from '../../contexts/OnboardingContext';

export default function CompletionScreen() {
  const { data, resetOnboarding } = useOnboarding();
  const { signupWithOnboardingData } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleStart = async () => {
    setIsLoading(true);
    try {
      await signupWithOnboardingData(data);
      resetOnboarding(); // 온보딩 데이터 초기화
      // AuthContext에서 자동으로 라우팅 처리됨
    } catch (error) {
      // 에러는 AuthContext에서 이미 Alert으로 처리됨
      console.error('회원가입 최종 처리 실패:', error);
      Alert.alert('오류', '회원가입 중 문제가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🎉</Text>
        </View>
        
        <Text style={styles.title}>가입이 완료되었어요!</Text>
        <Text style={styles.subtitle}>
          {data.name || data.nickname}님, 저희 서비스에 오신 것을 환영합니다!
        </Text>
        <Text style={styles.description}>
          이제 모든 준비가 끝났습니다. {'\n'}
          지금 바로 서비스를 시작해보세요.
        </Text>
        
        <TouchableOpacity
          style={[styles.startButton, isLoading && styles.disabledButton]}
          onPress={handleStart}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.startButtonText}>시작하기</Text>
          )}
        </TouchableOpacity>
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
    fontSize: 80,
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
    marginBottom: 12,
    color: '#666',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#888',
    marginBottom: 48,
    lineHeight: 24,
  },
  startButton: {
    backgroundColor: '#007AFF',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
