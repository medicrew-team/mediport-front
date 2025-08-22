import React, { createContext, ReactNode, useContext, useState } from 'react';
import { OnboardingData, OnboardingStep } from '../types/onboarding';

interface OnboardingContextType {
  currentStep: OnboardingStep;
  data: OnboardingData;
  setCurrentStep: (step: OnboardingStep) => void;
  updateData: (newData: Partial<OnboardingData>) => void;
  nextStep: () => void;
  previousStep: () => void;
  resetOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const initialData: OnboardingData = {
  language: '',
  name: '',
  nickname: '',
  gender: '',
  birthDate: '',
  email: '',
  emailVerified: false,
  password: '', // 초기값 추가
  nationality: '',
  phone: '',
  countryCode: '+82',
  residence: '',
  medicalConditions: [],
  medications: [],
};

// MemberCheck는 라우팅으로 처리되므로, OnboardingContext의 내부 단계 순서에서는 제외
// 하지만 OnboardingStep 타입에는 포함하여 상태로 관리할 수 있도록 함
const stepOrder: OnboardingStep[] = [
  'language',
  'member-check', // 이 단계는 OnboardingFlow에서 직접 렌더링하지 않고, 라우팅으로 처리됨
  'basic-info',
  'email-verification',
  'password-setup', // 새로운 비밀번호 설정 단계 추가
  'location-contact',
  'medical-conditions',
  'medications',
  'completion'
];

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('language');
  const [data, setData] = useState<OnboardingData>(initialData);

  const updateData = (newData: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...newData }));
  };

  const nextStep = () => {
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  };

  const previousStep = () => {
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  const resetOnboarding = () => {
    setCurrentStep('language');
    setData(initialData);
  };

  return (
    <OnboardingContext.Provider
      value={{
        currentStep,
        data,
        setCurrentStep,
        updateData,
        nextStep,
        previousStep,
        resetOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
