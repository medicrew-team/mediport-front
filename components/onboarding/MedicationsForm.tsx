import React, { useState, useRef, useEffect } from 'react';
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  Platform,
  ScrollView,
} from 'react-native';
import { useOnboarding } from '../../contexts/OnboardingContext';

interface Medication {
  medi_name: string;
  start_date: string;
  end_date: string;
  status: string;  // '복용중' | '복용완료'
  dosage: string;
}

// ScrollPicker 컴포넌트
const ScrollPicker = ({ data, selectedValue, onValueChange, style }: {
  data: string[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  style?: any;
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const selectedIndex = data.indexOf(selectedValue);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (scrollViewRef.current && selectedIndex >= 0) {
      const yPosition = selectedIndex * 40;
      scrollViewRef.current.scrollTo({
        y: Math.max(0, yPosition),
        animated: isInitialized
      });
      if (!isInitialized) setIsInitialized(true);
    }
  }, [selectedValue, selectedIndex, isInitialized]);

  return (
    <View style={[styles.scrollPickerContainer, style]}>
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={40}
        decelerationRate="fast"
        contentContainerStyle={{ paddingVertical: 80, width: 80 }}
        onMomentumScrollEnd={(event) => {
          const y = event.nativeEvent.contentOffset.y;
          const index = Math.round(y / 40);
          const clampedIndex = Math.max(0, Math.min(data.length - 1, index));
          if (clampedIndex !== selectedIndex) onValueChange(data[clampedIndex]);
        }}
      >
        {data.map((item) => (
          <TouchableOpacity key={item} style={styles.scrollPickerItem} onPress={() => onValueChange(item)}>
            <Text style={[styles.scrollPickerText, selectedValue === item && styles.selectedScrollText]}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.selectionIndicator} pointerEvents="none">
        <View style={styles.selectionBorder} />
      </View>
    </View>
  );
};

// 날짜 생성 함수
const generateYears = () => {
  const currentYear = new Date().getFullYear();
  const years: string[] = [];
  for (let year = currentYear; year >= currentYear - 100; year--) years.push(year.toString());
  return years;
};
const generateMonths = () => Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
const generateDays = (year: string, month: string) => {
  const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
  return Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString().padStart(2, '0'));
};
const parseDate = (dateString: string) => {
  if (!dateString) return { year: new Date().getFullYear().toString(), month: '01', day: '01' };
  const [year, month, day] = dateString.split('-');
  return { year, month, day };
};

export default function MedicationsForm() {
  const { data, updateData, nextStep, previousStep } = useOnboarding();

  const [medications, setMedications] = useState<Medication[]>(
    Array.isArray(data.medications)
      ? (data.medications as Medication[])
      : [{ medi_name: '', start_date: '', end_date: '', status: '', dosage: '' }]
  );

  const handleChange = (index: number, field: keyof Medication, value: string) => {
    const updated = [...medications];
    updated[index] = { ...updated[index], [field]: value };
    setMedications(updated);
  };

  const addRow = () => setMedications([...medications, { medi_name: '', start_date: '', end_date: '', status: '', dosage: '' }]);
  const removeRow = (index: number) => {
    const updated = [...medications];
    updated.splice(index, 1);
    setMedications(updated);
  };
  const handleNext = () => { updateData({ medications }); nextStep(); };
  const handleSkip = () => { updateData({ medications: [] }); nextStep(); };

  // 날짜 모달 상태
  const [showDateModal, setShowDateModal] = useState(false);
  const [dateIndex, setDateIndex] = useState<number | null>(null);
  const [dateField, setDateField] = useState<'start_date' | 'end_date' | null>(null);
  const [dateComponents, setDateComponents] = useState({ year: '2000', month: '01', day: '01' });

  const openDateModal = (index: number, field: 'start_date' | 'end_date') => {
    const currentDate = medications[index][field] ? parseDate(medications[index][field]) : parseDate('');
    setDateComponents(currentDate);
    setDateIndex(index);
    setDateField(field);
    setShowDateModal(true);
  };
  const handleDateConfirm = () => {
    if (dateIndex !== null && dateField) {
      const newDate = `${dateComponents.year}-${dateComponents.month}-${dateComponents.day}`;
      handleChange(dateIndex, dateField, newDate);
    }
    setShowDateModal(false);
  };
  const years = generateYears();
  const months = generateMonths();
  const days = generateDays(dateComponents.year, dateComponents.month);

  const handleYearChange = (year: string) => {
    const newDays = generateDays(year, dateComponents.month);
    const day = newDays.includes(dateComponents.day) ? dateComponents.day : newDays[newDays.length - 1];
    setDateComponents(prev => ({ ...prev, year, day }));
  };
  const handleMonthChange = (month: string) => {
    const newDays = generateDays(dateComponents.year, month);
    const day = newDays.includes(dateComponents.day) ? dateComponents.day : newDays[newDays.length - 1];
    setDateComponents(prev => ({ ...prev, month, day }));
  };
  const handleDayChange = (day: string) => setDateComponents(prev => ({ ...prev, day }));

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${(date.getMonth()+1).toString().padStart(2,'0')}월 ${date.getDate().toString().padStart(2,'0')}일`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 50 }}
        enableOnAndroid={true}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={previousStep} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.stepText}>6/6</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>복용 중인 약물</Text>
          <Text style={styles.subtitle}>
            현재 복용 중인 약물이 있다면 입력해주세요. {'\n'}(선택 사항)
          </Text>

          <View style={styles.form}>
            {medications.map((m, idx) => (
              <View key={idx} style={styles.inputContainer}>
                <TouchableOpacity onPress={() => removeRow(idx)} style={styles.removeButton}>
                  <Text style={styles.removeButtonText}>×</Text>
                </TouchableOpacity>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>약물명</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="약물명을 입력해주세요"
                    placeholderTextColor="#999"
                    value={m.medi_name}
                    onChangeText={(t) => handleChange(idx, 'medi_name', t)}
                  />
                </View>

                <View style={styles.dateRow}>
                  {['start_date','end_date'].map(field => (
                    <View style={styles.dateInputGroup} key={field}>
                      <Text style={styles.inputLabel}>{field==='start_date' ? '시작일' : '종료일'}</Text>
                      <TouchableOpacity
                        style={styles.dateInput}
                        onPress={() => openDateModal(idx, field as 'start_date' | 'end_date')}
                      >
                        <Text style={[styles.dateText, !m[field as 'start_date' | 'end_date'] && styles.placeholderText]}>
                          {m[field as 'start_date' | 'end_date'] ? formatDate(m[field as 'start_date' | 'end_date']) : '날짜 선택'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>현재 복용 여부</Text>
                  <View style={styles.radioContainer}>
                    {['복용중','복용완료'].map(status => (
                      <TouchableOpacity
                        key={status}
                        style={[styles.radioButton, m.status===status && styles.radioSelected]}
                        onPress={() => handleChange(idx, 'status', status)}
                      >
                        <Text style={[styles.radioText, m.status===status && styles.radioTextSelected]}>
                          {status}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>복용량</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="예: 1일 2회 100mg"
                    placeholderTextColor="#999"
                    value={m.dosage}
                    onChangeText={(t) => handleChange(idx, 'dosage', t)}
                  />
                </View>
              </View>
            ))}

            <TouchableOpacity onPress={addRow} style={styles.addButton}>
              <Text style={styles.addButtonText}>+ 약물 추가</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>다음</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>건너뛰기</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>

      {/* 날짜 선택 모달 (커스텀 스크롤형) */}
      <Modal visible={showDateModal} transparent={true} animationType="slide" onRequestClose={() => setShowDateModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowDateModal(false)} style={styles.modalButton}>
                <Text style={styles.modalButtonText}>취소</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{dateField==='start_date' ? '시작일 선택' : '종료일 선택'}</Text>
              <TouchableOpacity onPress={handleDateConfirm} style={styles.modalButton}>
                <Text style={[styles.modalButtonText, styles.confirmText]}>확인</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.datePickerContainer}>
              <View style={styles.datePickerColumn}>
                <Text style={styles.columnLabel}>년</Text>
                <ScrollPicker data={years} selectedValue={dateComponents.year} onValueChange={handleYearChange}/>
              </View>
              <View style={styles.datePickerColumn}>
                <Text style={styles.columnLabel}>월</Text>
                <ScrollPicker data={months} selectedValue={dateComponents.month} onValueChange={handleMonthChange}/>
              </View>
              <View style={styles.datePickerColumn}>
                <Text style={styles.columnLabel}>일</Text>
                <ScrollPicker data={days} selectedValue={dateComponents.day} onValueChange={handleDayChange}/>
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
    color: '#FF6600',
  },
  stepText: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    padding: 24,
  },
  title: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 32,
    color: '#666',
  },
  form: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 20,
    paddingTop: 45,
    borderRadius: 12,
    backgroundColor: '#fff',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
    minHeight: 45,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  dateInputGroup: {
    flex: 1,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
    backgroundColor: '#fafafa',
    minHeight: 40,
  },
  dateText: {
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  placeholderText: {
    color: '#999',
  },
  calendarIcon: {
    fontSize: 18,
    marginLeft: 8,
  },
  radioContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  radioButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#fff',
  },
  radioSelected: {
    borderColor: '#FF6600',
    backgroundColor: '#FFF4E6',
  },
  radioText: {
    fontSize: 14,
    color: '#666',
  },
  radioTextSelected: {
    color: '#FF6600',
    fontWeight: '600',
  },
  addButton: {
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF6600',
    borderStyle: 'dashed',
    borderRadius: 12,
    marginBottom: 24,
    backgroundColor: '#FFFAF7',
  },
  addButtonText: {
    color: '#FF6600',
    fontWeight: 'bold',
    fontSize: 16,
  },
  removeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FF6600',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  removeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    lineHeight: 20,
  },
  nextButton: {
    backgroundColor: '#FF6600',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  skipButton: {
    padding: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#FF6600',
    fontSize: 16,
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
    paddingBottom: 40,
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
    color: '#FF6600',
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },

  // 커스텀 스크롤 선택기 스타일
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
  selectedScrollItem: {},
  scrollPickerText: {
    fontSize: 18,
    color: '#666',
  },
  selectedScrollText: {
    color: '#FF6600',
    fontWeight: '600',
    fontSize: 20,
  },
  selectionIndicator: {
    position: 'absolute',
    top: 80,
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
    borderColor: '#FF6600',
    backgroundColor: 'rgba(255,102,0,0.1)',
  },
});
