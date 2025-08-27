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
