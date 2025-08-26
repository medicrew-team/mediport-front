import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import {
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { useTranslation } from "react-i18next";

// 커스텀 스크롤 휠 컴포넌트
const ScrollPicker = ({
  data,
  selectedValue,
  onValueChange,
  style
}: {
  data: string[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  style?: any;
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const selectedIndex = data.indexOf(selectedValue);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // selectedValue가 변경될 때마다 해당 위치로 스크롤
    if (scrollViewRef.current && selectedIndex >= 0) {
      // paddingVertical(80)을 빼서 중앙에 오도록 조정
      const yPosition = selectedIndex * 40;
      scrollViewRef.current.scrollTo({
        y: Math.max(0, yPosition),
        animated: isInitialized
      });

      if (!isInitialized) {
        setIsInitialized(true);
      }
    }
  }, [selectedValue, selectedIndex, isInitialized]);

  return (
    <View style={[styles.scrollPickerContainer, style]}>
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={40}
        decelerationRate="fast"
        contentContainerStyle={{
          paddingVertical: 80,
          width: 80
        }}
        onMomentumScrollEnd={(event) => {
          const y = event.nativeEvent.contentOffset.y;
          const index = Math.round((y) / 40);
          const clampedIndex = Math.max(0, Math.min(data.length - 1, index));
          if (clampedIndex !== selectedIndex) {
            onValueChange(data[clampedIndex]);
          }
        }}
      >
        {data.map((item, index) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.scrollPickerItem,
              selectedValue === item && styles.selectedScrollItem
            ]}
            onPress={() => onValueChange(item)}
          >
            <Text style={[
              styles.scrollPickerText,
              selectedValue === item && styles.selectedScrollText
            ]}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 선택 영역 표시 */}
      <View style={styles.selectionIndicator} pointerEvents="none">
        <View style={styles.selectionBorder} />
      </View>
    </View>
  );
};

// 날짜 데이터 생성 함수들
const generateYears = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = currentYear; year >= currentYear - 100; year--) {
    years.push(year.toString());
  }
  return years;
};

const generateMonths = () => {
  return Array.from({ length: 12 }, (_, i) =>
    (i + 1).toString().padStart(2, '0')
  );
};

const generateDays = (year: string, month: string) => {
  const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
  return Array.from({ length: daysInMonth }, (_, i) =>
    (i + 1).toString().padStart(2, '0')
  );
};

type GenderType = '' | 'male' | 'female' | 'other';

export default function BasicInfoForm() {
  const { t } = useTranslation();
  
  const { data, updateData, nextStep, previousStep } = useOnboarding();
  const [showDateModal, setShowDateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: data.name || '',
    nickname: data.nickname || '',
    gender: (data.gender || '') as GenderType,
    birthDate: data.birthDate || '',
  });

  // 날짜 파싱
  const parseDate = (dateString: string) => {
    if (!dateString) {
      const currentYear = new Date().getFullYear();
      return {
        year: (currentYear - 25).toString(),
        month: '01',
        day: '01'
      };
    }
    const [year, month, day] = dateString.split('-');
    return { year, month, day };
  };

  const [dateComponents, setDateComponents] = useState(() => parseDate(formData.birthDate));

  const years = generateYears();
  const months = generateMonths();
  const days = generateDays(dateComponents.year, dateComponents.month);

  const handleNext = () => {
    if (!formData.name.trim()) {
      Alert.alert('알림', '이름을 입력해주세요.');
      return;
    }
    if (!formData.nickname.trim()) {
      Alert.alert('알림', '닉네임을 입력해주세요.');
      return;
    }
    if (!formData.gender) {
      Alert.alert('알림', '성별을 선택해주세요.');
      return;
    }
    if (!formData.birthDate) {
      Alert.alert('알림', '생년월일을 선택해주세요.');
      return;
    }

    updateData(formData);
    nextStep();
  };

  const handleDateConfirm = () => {
    const birthDate = `${dateComponents.year}-${dateComponents.month}-${dateComponents.day}`;
    setFormData(prev => ({ ...prev, birthDate }));
    setShowDateModal(false);
  };

  const handleYearChange = (year: string) => {
    setDateComponents(prev => {
      const newDays = generateDays(year, prev.month);
      // 선택된 일이 새로운 월에 없으면 마지막 날로 조정
      const adjustedDay = newDays.includes(prev.day) ? prev.day : newDays[newDays.length - 1];
      return { ...prev, year, day: adjustedDay };
    });
  };

  const handleMonthChange = (month: string) => {
    setDateComponents(prev => {
      const newDays = generateDays(prev.year, month);
      // 선택된 일이 새로운 월에 없으면 마지막 날로 조정
      const adjustedDay = newDays.includes(prev.day) ? prev.day : newDays[newDays.length - 1];
      return { ...prev, month, day: adjustedDay };
    });
  };

  const handleDayChange = (day: string) => {
    setDateComponents(prev => ({ ...prev, day }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 20 }}
        enableOnAndroid={true}
        extraScrollHeight={50}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
          <View style={styles.header}>
            <TouchableOpacity onPress={previousStep} style={styles.backButton}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.title}>기본 정보를 입력해주세요</Text>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>이름 *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="실명을 입력해주세요"
                  placeholderTextColor="#999"
                  value={formData.name}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>닉네임 *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="사용하실 닉네임을 입력해주세요"
                  placeholderTextColor="#999"
                  value={formData.nickname}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, nickname: text }))}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>성별 *</Text>
                <View style={styles.genderContainer}>
                  {[
                    { key: 'male', label: '남성' },
                    { key: 'female', label: '여성' },
                    { key: 'other', label: '기타' },
                  ].map((option) => (
                    <TouchableOpacity
                      key={option.key}
                      style={[
                        styles.genderButton,
                        formData.gender === option.key && styles.selectedGender
                      ]}
                      onPress={() => setFormData(prev => ({ ...prev, gender: option.key as GenderType }))}
                    >
                      <Text style={[
                        styles.genderButtonText,
                        formData.gender === option.key && styles.selectedGenderText
                      ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>생년월일 *</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => {
                    if (formData.birthDate) {
                      setDateComponents(parseDate(formData.birthDate));
                    }
                    setShowDateModal(true);
                  }}
                >
                  <Text style={[
                    styles.dateButtonText,
                    !formData.birthDate && styles.placeholderText
                  ]}>
                    {formData.birthDate || '생년월일을 선택해주세요'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>다음</Text>
            </TouchableOpacity>
          </View>
      </KeyboardAwareScrollView>

      {/* 날짜 선택 모달 */}
      <Modal
        visible={showDateModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setShowDateModal(false)}
                style={styles.modalButton}
              >
                <Text style={styles.modalButtonText}>취소</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>생년월일 선택</Text>
              <TouchableOpacity
                onPress={handleDateConfirm}
                style={styles.modalButton}
              >
                <Text style={[styles.modalButtonText, styles.confirmText]}>확인</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.datePickerContainer}>
              <View style={styles.datePickerColumn}>
                <Text style={styles.columnLabel}>년</Text>
                <ScrollPicker
                  data={years}
                  selectedValue={dateComponents.year}
                  onValueChange={handleYearChange}
                />
              </View>

              <View style={styles.datePickerColumn}>
                <Text style={styles.columnLabel}>월</Text>
                <ScrollPicker
                  data={months}
                  selectedValue={dateComponents.month}
                  onValueChange={handleMonthChange}
                />
              </View>

              <View style={styles.datePickerColumn}>
                <Text style={styles.columnLabel}>일</Text>
                <ScrollPicker
                  data={days}
                  selectedValue={dateComponents.day}
                  onValueChange={handleDayChange}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFCF9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: '#ff6600',
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 32,
    color: '#333',
  },
  form: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  genderButton: {
    flex: 1,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  selectedGender: {
    borderColor: '#ff6600',
    backgroundColor: '#fffae6',
  },
  genderButtonText: {
    fontSize: 16,
    color: '#333',
  },
  selectedGenderText: {
    color: '#ff6600',
    fontWeight: '600',
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#fff',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },
  nextButton: {
    backgroundColor: '#ff6600',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // 모달 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 80,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalButton: {
    padding: 8,
    minWidth: 60,
  },
  modalButtonText: {
    fontSize: 16,
    color: '#666',
  },
  confirmText: {
    color: '#ff6600',
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },

  // 날짜 선택기 스타일
  datePickerContainer: {
    flexDirection: 'row',
    height: 240,
    paddingHorizontal: 16,
  },
  datePickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  columnLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  scrollPickerContainer: {
    height: 200,
    position: 'relative',
    overflow: 'hidden',
  },
  scrollPickerItem: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedScrollItem: {
    // 선택된 아이템 스타일은 indicator로 표시
  },
  scrollPickerText: {
    fontSize: 18,
    color: '#666',
  },
  selectedScrollText: {
    color: '#ff6600',
    fontWeight: '600',
    fontSize: 20,
  },
  selectionIndicator: {
    position: 'absolute',
    top: 80, // 중앙 위치
    left: 0,
    right: 0,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  selectionBorder: {
    width: '100%',
    height: 40,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#ff6600',
    backgroundColor: 'rgba(255, 102, 0, 0.1)',
  },
});