import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 앱 시작 시 저장된 토큰 확인
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const storedToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      const storedUser = await AsyncStorage.getItem(USER_DATA_KEY);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        // 토큰이 있으면 메인 페이지로 이동
        router.replace('/(tabs)');
      } else {
        // 토큰이 없으면 로그인 페이지로 이동
        router.replace('/login');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      router.replace('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // TODO: 실제 백엔드 API 호출
      // const response = await fetch('YOUR_API_ENDPOINT/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password }),
      // });
      // const data = await response.json();

      // 임시 더미 데이터 (실제 구현 시 삭제)
      const dummyToken = 'dummy_token_' + Date.now();
      const dummyUser = {
        id: '1',
        email: email,
        name: '사용자',
      };

      // 토큰과 사용자 정보 저장
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, dummyToken);
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(dummyUser));

      setToken(dummyToken);
      setUser(dummyUser);

      // 메인 페이지로 이동
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      // TODO: 실제 백엔드 API 호출
      // const response = await fetch('YOUR_API_ENDPOINT/signup', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password, name }),
      // });
      // const data = await response.json();

      // 임시 더미 데이터 (실제 구현 시 삭제)
      const dummyToken = 'dummy_token_' + Date.now();
      const dummyUser = {
        id: '1',
        email: email,
        name: name,
      };

      // 토큰과 사용자 정보 저장
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, dummyToken);
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(dummyUser));

      setToken(dummyToken);
      setUser(dummyUser);

      // 메인 페이지로 이동
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // 저장된 토큰과 사용자 정보 삭제
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      await AsyncStorage.removeItem(USER_DATA_KEY);

      setToken(null);
      setUser(null);

      // 로그인 페이지로 이동
      router.replace('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}