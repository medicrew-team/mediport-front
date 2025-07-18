import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import LoginForm from '../components/auth/LoginForm';
import SignupForm from '../components/auth/SignupForm';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { login, signup } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      // 성공 시 AuthContext에서 자동으로 라우팅 처리
    } catch (error) {
      Alert.alert('로그인 실패', '이메일 또는 비밀번호를 확인해주세요.');
    }
  };

  const handleSignup = async (name: string, email: string, country: string, fullPhone: string, password: string) => {
    try {
      await signup(name, email, country, fullPhone, password);
      // 성공 시 AuthContext에서 자동으로 라우팅 처리
    } catch (error) {
      Alert.alert('회원가입 실패', '다시 시도해주세요.');
    }
  };

  return (
    <View style={styles.container}>
      {isLogin ? (
        <LoginForm
          onLogin={handleLogin}
          onSwitchToSignup={() => setIsLogin(false)}
        />
      ) : (
        <SignupForm
          onSignup={handleSignup}
          onSwitchToLogin={() => setIsLogin(true)}
        />
      )}
    </View>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});