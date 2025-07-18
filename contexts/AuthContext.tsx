import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { auth } from '../config/firebase'; // Firebase config 파일 import

interface User {
  uid: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, country: string, fullPhone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Firebase Auth 상태 변화 감지
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();
          const userData: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || undefined
          };

          // 토큰과 사용자 정보를 AsyncStorage에 저장
          await AsyncStorage.setItem(AUTH_TOKEN_KEY, idToken);
          await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));

          setToken(idToken);
          setUser(userData);

          // 인증된 사용자라면 메인 페이지로 이동
          router.replace('/(tabs)');
        } catch (error) {
          handleAuthError();
        }
      } else {
        // 사용자가 로그아웃되었거나 인증되지 않음
        await clearAuthData();
        router.replace('/login');
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  // 앱 시작 시 저장된 토큰 확인 (토큰 갱신 포함)
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const storedToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      const storedUser = await AsyncStorage.getItem(USER_DATA_KEY);

      if (storedToken && storedUser && auth.currentUser) {
        // 토큰이 만료되었을 수 있으니 새로 가져오기
        const freshToken = await auth.currentUser.getIdToken(true);
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, freshToken);
        
        setToken(freshToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      // console.error('Auth 상태 확인 실패:', error);
      handleAuthError();
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // 사용자 친화적인 입력값 검증
      if (!email || !email.trim()) {
        Alert.alert('오류', '이메일을 입력해주세요.');
        return;
      }

      if (!password) {
        Alert.alert('오류', '비밀번호를 입력해주세요.');
        return;
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        Alert.alert('오류', '올바른 이메일 형식을 입력해주세요.');
        return;
      }
      
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const firebaseUser = userCredential.user;
      const idToken = await firebaseUser.getIdToken();
      
      const userData: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: firebaseUser.displayName || undefined
      };

      // 토큰과 사용자 정보 저장
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, idToken);
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));

      setToken(idToken);
      setUser(userData);

      // onAuthStateChanged에서 자동으로 페이지 이동 처리됨
    } catch (error: any) {
      
      let errorMessage = '로그인에 실패했습니다.';
      if (error.code) {
        switch (error.code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
            errorMessage = '이메일 또는 비밀번호가 올바르지 않습니다.';
            break;
          case 'auth/user-disabled':
            errorMessage = '계정이 비활성화되었습니다. 관리자에게 문의하세요.';
            break;
          case 'auth/too-many-requests':
            errorMessage = '로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.';
            break;
          case 'auth/network-request-failed':
            errorMessage = '네트워크 연결을 확인해주세요.';
            break;
          default:
            errorMessage = '로그인에 실패했습니다. 다시 시도해주세요.';
        }
      }
      
      Alert.alert('로그인 실패', errorMessage);
    }
  };

  const signup = async (name: string, email: string, country: string, fullPhone: string, password: string) => {
    try {
      // 사용자 친화적인 입력값 검증
      if (!name || !name.trim()) {
        Alert.alert('오류', '이름을 입력해주세요.');
        return;
      }

      if (!email || !email.trim()) {
        Alert.alert('오류', '이메일을 입력해주세요.');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        Alert.alert('오류', '올바른 이메일 형식을 입력해주세요.');
        return;
      }

      if (!country) {
        Alert.alert('오류', '국가를 선택해주세요.');
        return;
      }

      if (!fullPhone || fullPhone.length < 10) {
        Alert.alert('오류', '전화번호를 입력해주세요(숫자만).');
        return;
      }

      if (!password) {
        Alert.alert('오류', '비밀번호를 입력해주세요.');
        return;
      }
      if (password.length < 6) {
        Alert.alert('오류', '비밀번호는 6자리 이상이어야 합니다.');
        return;
      }
      
      console.log('Firebase 회원가입 시도 중...');
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const firebaseUser = userCredential.user;
      
      // 사용자 프로필 업데이트 (displayName 설정)
      if (name && name.trim()) {
        await updateProfile(firebaseUser, { displayName: name.trim() });
      }
      
      const idToken = await firebaseUser.getIdToken();
      
      const userData: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: name?.trim() || firebaseUser.displayName || undefined
      };

      // 토큰과 사용자 정보 저장
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, idToken);
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));

      setToken(idToken);
      setUser(userData);

      // onAuthStateChanged에서 자동으로 페이지 이동 처리됨
    } catch (error: any) {

      let errorMessage = '회원가입에 실패했습니다.';
      if (error.code) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            errorMessage = '이미 사용 중인 이메일입니다. 다른 이메일을 사용해주세요.';
            break;
          case 'auth/weak-password':
            errorMessage = '비밀번호가 너무 약합니다. 더 강한 비밀번호를 입력해주세요.';
            break;
          case 'auth/operation-not-allowed':
            errorMessage = '이메일 회원가입이 비활성화되어 있습니다. 관리자에게 문의하세요.';
            break;
          case 'auth/too-many-requests':
            errorMessage = '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
            break;
          case 'auth/network-request-failed':
            errorMessage = '네트워크 연결을 확인해주세요.';
            break;
          default:
            errorMessage = '회원가입에 실패했습니다. 다시 시도해주세요.';
        }
      }
      
      Alert.alert('회원가입 실패', errorMessage);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      // onAuthStateChanged에서 자동으로 clearAuthData와 페이지 이동 처리됨
    } catch (error) {

      await clearAuthData();
      router.replace('/login');
    }
  };

  const clearAuthData = async () => {
    try {
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      await AsyncStorage.removeItem(USER_DATA_KEY);
      setToken(null);
      setUser(null);
    } catch (error) {
      // console.error('Auth 데이터 정리 실패:', error);
    }
  };

  const handleAuthError = async () => {
    await clearAuthData();
    router.replace('/login');
  };

  // 토큰이 만료되기 전에 갱신하는 유틸리티 함수
  const refreshToken = async (): Promise<string | null> => {
    try {
      if (auth.currentUser) {
        const freshToken = await auth.currentUser.getIdToken(true);
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, freshToken);
        setToken(freshToken);
        return freshToken;
      }
      return null;
    } catch (error) {
      // console.error('토큰 갱신 실패:', error);
      return null;
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