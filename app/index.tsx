import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

const ONBOARDING_COMPLETED_KEY = 'onboarding_completed';

export default function AppEntry() {
  const { user, isLoading } = useAuth();
  const redirectAttempted = useRef(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const userEmailRef = useRef<string | null>(null); // user 객체 변화 추적용

  useEffect(() => {
    // user의 실제 변화만 감지 (객체 재생성 무시)
    const currentUserEmail = user?.email || null;
    const hasUserChanged = userEmailRef.current !== currentUserEmail;
    
    if (hasUserChanged) {
      userEmailRef.current = currentUserEmail;
      redirectAttempted.current = false; // user가 실제로 변경되면 리셋
    }

    console.log('AppEntry useEffect triggered. user:', currentUserEmail, 'isLoading:', isLoading, 'redirectAttempted:', redirectAttempted.current, 'userChanged:', hasUserChanged);

    const checkAndRedirect = async () => {
      // 이미 리다이렉션 중이거나 로딩 중이면 실행하지 않음
      if (isLoading || redirectAttempted.current || isRedirecting) {
        return;
      }

      try {
        redirectAttempted.current = true;
        setIsRedirecting(true);

        const onboardingCompleted = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
        
        if (user) {
          // 사용자가 로그인되어 있으면
          if (onboardingCompleted === 'true') {
            console.log('AppEntry: User logged in and onboarding complete. Redirecting to /(tabs)');
            router.replace('/(tabs)'); // 메인 탭으로 이동
          } else {
            console.log('AppEntry: User logged in but onboarding not complete. Redirecting to /onboarding');
            router.replace('/onboarding');
          }
        } else {
          // 사용자가 로그아웃되었거나 로그인되어 있지 않으면
          console.log('AppEntry: No user logged in (logged out or not authenticated). Redirecting to /onboarding');
          router.replace('/onboarding');
        }
      } catch (error) {
        console.error('AppEntry: Error during redirect:', error);
        redirectAttempted.current = false;
        setIsRedirecting(false);
      }
    };

    // 로딩이 완료되고 리다이렉션을 시도하지 않았을 때만 실행
    if (!isLoading && !redirectAttempted.current) {
      checkAndRedirect();
    }
  }, [user?.email, isLoading]); // user 대신 user.email을 의존성으로 사용

  if (isLoading || isRedirecting) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // 이 지점에 도달하면 안됨 (리다이렉션 실패)
  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
});