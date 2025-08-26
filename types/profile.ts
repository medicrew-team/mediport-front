export const languages = [
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'zh-CN', name: '中文', flag: '🇨🇳' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'th', name: 'ไทย', flag: '🇹🇭' },
  { code: 'fil', name: 'Filipino', flag: '🇵🇭' },
];
// 사용자 타입 정의
export interface User {
  language: string;
  user_id: string;
  username: string;
  nickname: string;
  email: string;
  gender: string;
  user_img?: string | null;
  birthday?: string;
  phone?: string;
  country?: string;
  residence?: string;
  diseases?: { id: number }[];
  history?: {
    history_id: number;
    name: string;
    start_date: string;
    end_date: string;
    status: string;
    dosage: string;
  }[];
}

export interface InfoScreenProps {
  user: User | null;
  onBack: () => void;
  onUpdate?: () => void;
}

export interface Medication {
  history_id?: number; // API에서 가져온 ID
  medi_name: string;
  start_date: string;
  end_date?: string;
  status: string; // '복용중' | '복용완료'
  dosage: string;
}

// 질병 목록 상수
export const DISEASES = [
  { disease_id: 1, disease_name: '고혈압' },
  { disease_id: 2, disease_name: '당뇨병' },
  { disease_id: 3, disease_name: '고지혈증' },
  { disease_id: 4, disease_name: '심부전' },
  { disease_id: 5, disease_name: '협심증' },
  { disease_id: 6, disease_name: '뇌졸증' },
  { disease_id: 7, disease_name: '통풍' },
  { disease_id: 8, disease_name: '천식' },
  { disease_id: 9, disease_name: '관절염' },
];