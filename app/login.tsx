import React from 'react';
import { StyleSheet, View } from 'react-native';
import LoginForm from '../components/auth/LoginForm';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      // 성공 시 AuthContext에서 자동으로 라우팅 처리
    } catch (error) {
      // 에러 처리는 AuthContext의 login 함수에서 이미 처리됨
      console.log('Login error handled in AuthContext');
    }
  };

  return (
    <View style={styles.container}>
      <LoginForm onLogin={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFCF9',
  },
});
