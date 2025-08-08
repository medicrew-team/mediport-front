export interface OnboardingData {
  // Step 1: Language
  language: string;
  
  // Step 2: Member check - handled by routing
  
  // Step 3: Basic Info
  name: string;
  nickname: string;
  gender: 'male' | 'female' | 'other' | '';
  birthDate: string;
  
  // Step 4: Email & Verification
  email: string;
  emailVerified: boolean;
  
  // Step 5: Password Setup (NEW)
  password?: string; // 비밀번호 필드 추가
  
  // Step 6: Location & Contact (기존 Step 5)
  nationality: string;
  phone: string; // 국가코드 제외한 순수 전화번호
  countryCode: string; // 예: +82
  residence: string;
  
  // Step 7: Medical History (optional) (기존 Step 6)
  medicalConditions: string;
  
  // Step 8: Medications (optional) (기존 Step 7)
  medications: string;
}

export type OnboardingStep = 
  | 'language'
  | 'member-check' // 이 단계는 라우팅으로 처리되지만, OnboardingContext에서는 상태로 유지
  | 'basic-info'
  | 'email-verification'
  | 'password-setup' // 새로운 비밀번호 설정 단계 추가
  | 'location-contact'
  | 'medical-conditions'
  | 'medications'
  | 'completion';
