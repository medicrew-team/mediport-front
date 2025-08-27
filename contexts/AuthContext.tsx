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
import { BASE_URL } from '../types/ip';
import { t } from 'i18next';

interface User {
  user_id: string;
  email: string;
  name?: string;
  nickname?: string;
  gender?: string;
  birthDate?: string; // birthday로 매핑
  nationality?: string; // country로 매핑
  phone?: string;
  residence?: string;
  medicalConditions?: number[];
  medications?: object[];
  languages?: string; // language로 매핑
  user_img?: string;

  // 백엔드에서 사용하는 필드명들 (매핑용)
  country?: string; // nationality와 동일
  birthday?: string; // birthDate와 동일
  disease_ids?: number[]; // medicalConditions와 동일
  history?: any[]; // medications와 동일
  language?: string; // languages와 동일
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

  // API 요청 헬퍼 함수 (Firebase ID 토큰 사용)
  const apiRequest = async (endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', body?: any, firebaseToken?: string) => {
    try {
      const authToken = firebaseToken || token;

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        },
        body: body ? JSON.stringify(body) : undefined
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API 요청 실패');
      }

      return data;
    } catch (error) {
      console.error(`API 요청 실패 (${endpoint}):`, error);
      throw error;
    }
  };

  // 백엔드 응답 데이터를 프론트엔드 User 형태로 변환
  const mapBackendUserToFrontend = (backendUser: any): User => {
    return {
      user_id: backendUser.user_id,
      email: backendUser.email,
      name: backendUser.name,
      nickname: backendUser.nickname,
      gender: backendUser.gender,
      birthDate: backendUser.birthday || backendUser.birthDate, // birthday -> birthDate
      nationality: backendUser.country || backendUser.nationality, // country -> nationality
      phone: backendUser.phone,
      residence: backendUser.residence,
      medicalConditions: backendUser.disease_ids || backendUser.medicalConditions, // disease_ids -> medicalConditions
      medications: backendUser.history || backendUser.medications, // history -> medications
      languages: backendUser.language || backendUser.languages, // language -> languages
      user_img: backendUser.user_img,

      // 백엔드 원본 필드들도 유지 (필요한 경우를 위해)
      country: backendUser.country,
      birthday: backendUser.birthday,
      disease_ids: backendUser.disease_ids,
      history: backendUser.history,
      language: backendUser.language
    };
  };

  // 백엔드 회원가입 API 호출
  const registerUserToBackend = async (firebaseUser: any, onboardingData: OnboardingData, firebaseToken: string) => {
    // disease_ids 처리 - medicalConditions를 배열로 변환
    let diseaseIds: number[] = [];
    if (onboardingData.medicalConditions) {
      // medicalConditions가 문자열인 경우 파싱 처리
      try {
        diseaseIds = typeof onboardingData.medicalConditions === 'string'
          ? JSON.parse(onboardingData.medicalConditions)
          : onboardingData.medicalConditions;
      } catch (error) {
        console.warn('medicalConditions 파싱 실패:', error);
        diseaseIds = [];
      }
    }

    // history 처리 - medications를 배열로 변환
    let history: any[] = [];
    if (onboardingData.medications) {
      try {
        history = typeof onboardingData.medications === 'string'
          ? JSON.parse(onboardingData.medications)
          : onboardingData.medications;
      } catch (error) {
        console.warn('medications 파싱 실패:', error);
        history = [];
      }
    }

    const registerData = {
      user_id: firebaseUser.uid,
      email: firebaseUser.email,
      name: onboardingData.name,
      nickname: onboardingData.nickname,
      phone: onboardingData.countryCode + onboardingData.phone,
      country: onboardingData.nationality,
      residence: onboardingData.residence,
      gender: onboardingData.gender,
      birthday: onboardingData.birthDate,
      disease_ids: diseaseIds,
      history: history,
      user_img: null,
      language: onboardingData.language,
    };

    console.log('백엔드 회원가입 데이터:', registerData);
    const response = await apiRequest('/auth/register', 'POST', registerData, firebaseToken);
    return mapBackendUserToFrontend(response.userProfile);
  };

  // 백엔드 로그인 API 호출 (Firebase 토큰으로 인증)
  const loginUserToBackend = async (firebaseToken: string) => {
    const response = await apiRequest('/auth/login', 'POST', {}, firebaseToken);
    return mapBackendUserToFrontend(response); // API 문서에 따르면 userProfile을 반환
  };

  // 백엔드 로그아웃 API 호출 (Firebase 토큰으로 인증)
  const logoutUserFromBackend = async (firebaseToken: string) => {
    await apiRequest('/auth/logout', 'POST', {}, firebaseToken);
  };

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

  // 앱 시작 시 저장된 토큰 확인
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
        await clearAuthData();
      }
    } catch (error) {
      console.error('Auth 상태 확인 실패:', error);
      await clearAuthData();
    } finally {
      setIsLoading(false);
    }
  };

  const [isSignupInProgress, setIsSignupInProgress] = useState(false);
  // Firebase Auth 상태 변화 감지
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();
          setToken(idToken);

          // 회원가입 중이면 백엔드 로그인 호출 건너뜀
          if (isSignupInProgress) {
            console.log('회원가입 중이므로 onAuthStateChanged에서 백엔드 로그인 생략');
            return;
          }

          const storedUserData = await AsyncStorage.getItem(USER_DATA_KEY);

          if (storedUserData) {
            setUser(JSON.parse(storedUserData));
          } else {
            try {
              const backendUser = await loginUserToBackend(idToken);
              await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(backendUser));
              setUser(backendUser);
            } catch (backendError) {
              console.error('백엔드 사용자 조회 실패:', backendError);
              setUser({
                user_id: firebaseUser.uid,
                email: firebaseUser.email || '',
                name: firebaseUser.displayName || undefined,
              });
            }
          }

          await AsyncStorage.setItem(AUTH_TOKEN_KEY, idToken);
        } catch (error) {
          console.error('Auth state change error:', error);
          await clearAuthData();
        }
      } else {
        await clearAuthData();
      }
    });

    return unsubscribe;
  }, [isSignupInProgress]);

  // 앱 시작 시 저장된 토큰 확인
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const signupWithOnboardingData = async (onboardingData: OnboardingData) => {
    setIsSignupInProgress(true);
    let firebaseUser: any = null;
    try {
      if (!onboardingData.password) {
        return;
      }
      // 1. Firebase 회원가입
      console.log('AuthContext: Firebase 회원가입 시도 중...');
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        onboardingData.email.trim(),
        onboardingData.password
      );
      firebaseUser = userCredential.user;

      // Firebase 프로필 업데이트
      if (onboardingData.name && onboardingData.name.trim()) {
        await updateProfile(firebaseUser, {
          displayName: onboardingData.name.trim()
        });
      }

      const idToken = await firebaseUser.getIdToken();

      try {
        // 2. 백엔드에 사용자 등록
        const backendUser = await registerUserToBackend(firebaseUser, onboardingData, idToken);

        // 3. 로컬 스토리지에 저장
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, idToken);
        await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(backendUser));
        await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');

        // 4. 상태 업데이트
        setToken(idToken);
        setUser(backendUser);

        console.log('AuthContext: Signup successful with backend integration');
        router.replace('/(tabs)');

      } catch (backendError) {
        console.error('백엔드 회원가입 실패:', backendError);

        if (firebaseUser) {
          try {
            await firebaseUser.delete();
          } catch (deleteError) {
            console.error('Firebase 사용자 삭제 실패:', deleteError);
          }
        }
        throw new Error('서버 등록에 실패했습니다. 다시 시도해주세요.');
      }
      const backendUser = await registerUserToBackend(firebaseUser, onboardingData, idToken);

      await AsyncStorage.setItem(AUTH_TOKEN_KEY, idToken);
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(backendUser));
      await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');

      setToken(idToken);
      setUser(backendUser);

      router.replace('/(tabs)');
      
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
            errorMessage = error.message || '회원가입에 실패했습니다. 다시 시도해주세요.';
        }
      }

      console.error('회원가입 실패', errorMessage);
      if (firebaseUser) {
        try {
          await firebaseUser.delete();
        } catch (deleteError) {
          console.error('Firebase 사용자 삭제 실패:', deleteError);
        }
      }
      throw error;
    } finally {
      setIsSignupInProgress(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // 입력 검증
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        Alert.alert(t('onboarding.alert.error'), t('onboarding.alert.emailRegex?'));
        return;
      }

      // 1. Firebase 로그인
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const firebaseUser = userCredential.user;
      const idToken = await firebaseUser.getIdToken();

      // 2. 백엔드에서 사용자 정보 조회
      try {
        const backendUser = await loginUserToBackend(idToken);

        // 3. 로컬 스토리지에 저장
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, idToken);
        await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(backendUser));
        await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');

        // 4. 상태 업데이트
        setToken(idToken);
        setUser(backendUser);

        console.log('AuthContext: Login successful with backend integration');
        router.replace('/(tabs)');

      } catch (backendError) {
        console.error('백엔드 로그인 실패:', backendError);

        // 백엔드 로그인 실패 시 Firebase 로그아웃
        await signOut(auth);
        throw new Error('서버 연결에 문제가 있습니다. 잠시 후 다시 시도해주세요.');
      }

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
            errorMessage = error.message || '로그인에 실패했습니다. 다시 시도해주세요.';
        }
      }

      Alert.alert(t('onboarding.alert.loginfail'));
      console.log('로그인 실패', errorMessage);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('AuthContext: Starting logout process');

      // 1. 백엔드 로그아웃 (현재 Firebase 토큰이 있는 경우)
      if (token) {
        try {
          await logoutUserFromBackend(token);
          console.log('AuthContext: Backend logout successful');
        } catch (backendError) {
          console.error('백엔드 로그아웃 실패:', backendError);
          // 백엔드 로그아웃 실패해도 계속 진행
        }
      }

      // 2. Firebase 로그아웃
      await signOut(auth);

      // 3. 로컬 데이터 정리 및 리다이렉션
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