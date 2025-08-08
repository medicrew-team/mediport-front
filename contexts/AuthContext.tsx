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
import { auth } from '../config/firebase';
import { OnboardingData } from '../types/onboarding';

interface User {
  uid: string;
  email: string;
  name?: string;
  nickname?: string;
  // 추가 사용자 정보들
  gender?: string;
  birthDate?: string;
  nationality?: string;
  phone?: string;
  residence?: string;
  medicalConditions?: string;
  medications?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signupWithOnboardingData: (onboardingData: OnboardingData) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';
const ONBOARDING_COMPLETED_KEY = 'onboarding_completed';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Auth 데이터 정리 함수
  const clearAuthData = async () => {
    try {
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      await AsyncStorage.removeItem(USER_DATA_KEY);
      await AsyncStorage.removeItem(ONBOARDING_COMPLETED_KEY);
      console.log('Auth data cleared. User and token states reset.');
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Auth 데이터 정리 실패:', error);
    }
  };

  // 인증 에러 처리 함수 (더 이상 리디렉션은 하지 않음)
  const handleAuthError = async () => {
    await clearAuthData();
    // router.replace('/onboarding'); // app/index.tsx에서 라우팅 처리
  };

  // 앱 시작 시 저장된 토큰 확인 (토큰 갱신 포함)
  const checkAuthStatus = async () => {
    try {
      const storedToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      const storedUser = await AsyncStorage.getItem(USER_DATA_KEY);
      
      if (storedToken && storedUser && auth.currentUser) {
        const freshToken = await auth.currentUser.getIdToken(true);
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, freshToken);
        
        setToken(freshToken);
        setUser(JSON.parse(storedUser));
      } else {
        // 토큰이나 사용자 정보가 없으면 상태 초기화
        await clearAuthData();
      }
    } catch (error) {
      console.error('Auth 상태 확인 실패:', error);
      await clearAuthData(); // 오류 발생 시에도 데이터 정리
    } finally {
      setIsLoading(false); // 초기 로딩 완료
    }
  };

  // Firebase Auth 상태 변화 감지
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();
          const storedUserData = await AsyncStorage.getItem(USER_DATA_KEY);
          
          let userData: User;
          if (storedUserData) {
            userData = JSON.parse(storedUserData);
          } else {
            userData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || undefined
            };
          }

          await AsyncStorage.setItem(AUTH_TOKEN_KEY, idToken);
          await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
          
          setToken(idToken);
          setUser(userData);
          console.log('AuthContext: Firebase user state changed. User:', firebaseUser.email);

        } catch (error) {
          console.error('Auth state change error:', error);
          await clearAuthData();
        }
      } else {
        console.log('AuthContext: No Firebase user detected. Clearing auth data.');
        await clearAuthData();
      }
      // setIsLoading(false); // checkAuthStatus에서 처리하므로 여기서는 제거
    });

    return unsubscribe;
  }, []);

  // 앱 시작 시 저장된 토큰 확인 (초기 로딩)
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    try {
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

      await AsyncStorage.setItem(AUTH_TOKEN_KEY, idToken);
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
      await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true'); // 로그인 시 온보딩 완료로 표시
      console.log('AuthContext: Login successful. ONBOARDING_COMPLETED_KEY set to true. User:', userData.email);
      
      setToken(idToken);
      setUser(userData);
      router.replace('/'); 

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
      throw error;
    }
  };

  const signupWithOnboardingData = async (onboardingData: OnboardingData) => {
    try {
      if (!onboardingData.name || !onboardingData.name.trim()) {
        Alert.alert('오류', '이름을 입력해주세요.');
        return;
      }
      if (!onboardingData.email || !onboardingData.email.trim()) {
        Alert.alert('오류', '이메일을 입력해주세요.');
        return;
      }
      if (!onboardingData.password) {
        Alert.alert('오류', '비밀번호를 입력해주세요.');
        return;
      }
      if (onboardingData.password.length < 6) {
        Alert.alert('오류', '비밀번호는 6자리 이상이어야 합니다.');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(onboardingData.email.trim())) {
        Alert.alert('오류', '올바른 이메일 형식을 입력해주세요.');
        return;
      }

      console.log('AuthContext: Firebase 회원가입 시도 중...');
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        onboardingData.email.trim(), 
        onboardingData.password
      );
      const firebaseUser = userCredential.user;

      if (onboardingData.name && onboardingData.name.trim()) {
        await updateProfile(firebaseUser, { 
          displayName: onboardingData.name.trim() 
        });
      }

      const idToken = await firebaseUser.getIdToken();

      const userData: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: onboardingData.name?.trim(),
        nickname: onboardingData.nickname?.trim(),
        gender: onboardingData.gender,
        birthDate: onboardingData.birthDate,
        nationality: onboardingData.nationality,
        phone: onboardingData.countryCode + onboardingData.phone,
        residence: onboardingData.residence,
        medicalConditions: onboardingData.medicalConditions,
        medications: onboardingData.medications,
      };

      await AsyncStorage.setItem(AUTH_TOKEN_KEY, idToken);
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
      await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
      console.log('AuthContext: Signup successful. ONBOARDING_COMPLETED_KEY set to true. User:', userData.email);
      
      setToken(idToken);
      setUser(userData);
      router.replace('/'); 
      
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
          default:
            errorMessage = '회원가입에 실패했습니다. 다시 시도해주세요.';
        }
      }

      Alert.alert('회원가입 실패', errorMessage);
      throw error;
    }
  };

  const logout = async () => {
  try {
    console.log('AuthContext: Starting logout process');
    await signOut(auth);
    
    // Firebase signOut이 성공해도 명시적으로 데이터 정리 및 리다이렉션
    await clearAuthData();
    console.log('AuthContext: Logout successful, redirecting to onboarding');
    router.replace('/onboarding');
    
  } catch (error) {
    console.error('AuthContext: Logout failed:', error);
    await clearAuthData();
    
    // 에러가 발생해도 온보딩으로 이동
    console.log('AuthContext: Logout error occurred, redirecting to onboarding');
    router.replace('/onboarding');
  }
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
      console.error('토큰 갱신 실패:', error);
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
        signupWithOnboardingData,
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
