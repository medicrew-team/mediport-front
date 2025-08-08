import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import BasicInfoForm from '../components/onboarding/BasicInfoForm';
import CompletionScreen from '../components/onboarding/CompletionScreen';
import EmailVerificationForm from '../components/onboarding/EmailVerificationForm';
import LanguageSelection from '../components/onboarding/LanguageSelection';
import LocationContactForm from '../components/onboarding/LocationContactForm';
import MedicalConditionsForm from '../components/onboarding/MedicalConditionsForm';
import MedicationsForm from '../components/onboarding/MedicationsForm';
import MemberCheck from '../components/onboarding/MemberCheck';
import PasswordSetupForm from '../components/onboarding/PasswordSetupForm';
import ProgressIndicator from '../components/onboarding/ProgressIndicator';
import { OnboardingProvider, useOnboarding } from '../contexts/OnboardingContext';

// 온보딩 단계 순서 정의 (MemberCheck는 라우팅으로 처리되므로 제외)
const onboardingSteps = [
  'language',
  'basic-info',
  'email-verification',
  'password-setup',
  'location-contact',
  'medical-conditions',
  'medications',
  'completion'
];

function OnboardingFlow() {
  const { currentStep } = useOnboarding();

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'language':
        return <LanguageSelection />;
      case 'member-check':
        return <MemberCheck />;
      case 'basic-info':
        return <BasicInfoForm />;
      case 'email-verification':
        return <EmailVerificationForm />;
      case 'password-setup':
        return <PasswordSetupForm />;
      case 'location-contact':
        return <LocationContactForm />;
      case 'medical-conditions':
        return <MedicalConditionsForm />;
      case 'medications':
        return <MedicationsForm />;
      case 'completion':
        return <CompletionScreen />;
      default:
        return <LanguageSelection />;
    }
  };

  const stepsForProgress = onboardingSteps.filter(
    step => step !== 'language' && step !== 'member-check' && step !== 'completion'
  );
  const currentStepIndexForProgress = stepsForProgress.indexOf(currentStep);
  const totalStepsForProgress = stepsForProgress.length;

  // ProgressIndicator에 전달할 currentStepIndex를 0 이상으로 보장
  const displayCurrentStepIndex = Math.max(0, currentStepIndexForProgress);

  return (
    <View style={styles.container}>
      {/* totalStepsForProgress가 0보다 클 때만 ProgressIndicator 렌더링 */}
      {currentStep !== 'language' && currentStep !== 'member-check' && currentStep !== 'completion' && totalStepsForProgress > 0 && (
        <SafeAreaView style={styles.progressIndicatorWrapper}>
          <ProgressIndicator 
            currentStepIndex={displayCurrentStepIndex}
            totalSteps={totalStepsForProgress}
          />
        </SafeAreaView>
      )}
      {renderCurrentStep()}
    </View>
  );
}

export default function OnboardingScreen() {
  return (
    <OnboardingProvider>
      <OnboardingFlow />
    </OnboardingProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressIndicatorWrapper: {
    // ProgressIndicator 자체의 paddingHorizontal을 고려하여 추가 스타일링이 필요할 수 있습니다.
    // 여기서는 SafeAreaView가 상단 여백을 자동으로 처리하도록 합니다.
  },
});
