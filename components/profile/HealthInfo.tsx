import { Feather } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useAuth } from '../../contexts/AuthContext';
import { BASE_URL } from '../../types/ip';
import { InfoScreenProps, Medication } from '../../types/profile';

// 질병 목록 상수
 const DISEASES = [
  { disease_id: 1, disease_name:"고혈압" },
  { disease_id: 2, disease_name: "당뇨병" },
  { disease_id: 3, disease_name: "고지혈증" },
  { disease_id: 4, disease_name: "심부전" },
  { disease_id: 5, disease_name: "협심증" },
  { disease_id: 6, disease_name: "뇌졸증" },
  { disease_id: 7, disease_name: "통풍" },
  { disease_id: 8, disease_name: "천식" },
  { disease_id: 9, disease_name: "관절염" },
];

const today = new Date();
const formatted = `${today.getFullYear()}-${(today.getMonth()+1).toString().padStart(2,'0')}-${today.getDate().toString().padStart(2,'0')}`;

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

const HealthInfoScreen: React.FC<InfoScreenProps> = ({ user, onBack, onUpdate }) => {
    const { token } = useAuth();
    const [selectedDiseases, setSelectedDiseases] = useState<number[]>([]);
    const [medications, setMedications] = useState<Medication[]>([]);

    // 날짜 선택 모달 상태
    const [showDateModal, setShowDateModal] = useState(false);
    const [dateIndex, setDateIndex] = useState<number | null>(null);
    const [dateField, setDateField] = useState<'start_date' | 'end_date' | null>(null);
    const [dateComponents, setDateComponents] = useState({ year: '2000', month: '01', day: '01' });

    useEffect(() => {
        if (user?.diseases) setSelectedDiseases(user.diseases.map(d => d.id));
        if (user?.history) setMedications(user.history.map(h => ({
            history_id: h.history_id,
            medi_name: h.name,
            start_date: h.start_date,
            end_date: h.end_date,
            status: h.status,
            dosage: h.dosage,
        })));
    }, [user]);

    const toggleDisease = (id: number) => {
        setSelectedDiseases(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]);
    };

    const handleDiseaseSave = async () => {
        try {
            const res = await fetch(`${BASE_URL}/users/profile/diseases`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ disease_ids: selectedDiseases }),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            Alert.alert('성공', '기저질환 정보가 업데이트되었습니다.');
            if (onUpdate) onUpdate();
        } catch (err) {
            console.error(err);
            Alert.alert('오류', '기저질환 업데이트에 실패했습니다.');
        }
    };

    const handleMedicationChange = (index: number, field: keyof Medication, value: string) => {
        const copy = [...medications];
        (copy[index] as any)[field] = value;
        setMedications(copy);
    };
    const handleAddMedication = () => {
        const newMed: Medication = {
          history_id: 0, // 서버에 아직 없음
          medi_name: '',
          start_date: formatted,
          end_date: formatted,
          status: '',
          dosage: ''
        };
        setMedications(prev => [...prev, newMed]);
      };


    const handleRemoveMedication = async (index: number) => {
        const historyId = medications[index].history_id; // 서버에서 받은 ID

        try {
            const res = await fetch(`${BASE_URL}/users/medications/${historyId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            setMedications(prev => prev.filter((_, i) => i !== index));
        } catch (err) {
            console.error(err);
            Alert.alert('오류', '복약 이력 삭제에 실패했습니다.');
        }
    };

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
            handleMedicationChange(dateIndex, dateField, newDate);
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
        return `${date.getFullYear()}년 ${(date.getMonth() + 1).toString().padStart(2, '0')}월 ${date.getDate().toString().padStart(2, '0')}일`;
    };

    const handleMedicationSave = async () => {
        try {
          const newMedications = await Promise.all(
            medications.map(async (m) => {
      
              // 서버가 기대하는 키(snake_case)로 맞춰 전송 페이로드 구성
              const payload = {
                medi_name: m.medi_name,     // ✅ 이름은 medi_name
                start_date: m.start_date,
                end_date: m.end_date,
                status: m.status,
                dosage: m.dosage,
              };
      
              if (m.history_id) {
                // ✅ 업데이트
                const res = await fetch(`${BASE_URL}/users/medications/${m.history_id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                  body: JSON.stringify({history:payload}),
                });
                if (!res.ok) {
                    console.log(payload)
                    throw new Error(`HTTP ${res.status}`);
                }
                return m;
              } else {
                // ✅ 신규 생성
                const res = await fetch(`${BASE_URL}/users/medications`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                  body: JSON.stringify({ user_id: user?.user_id, history: payload }), // ✅ history 안에 medi_name 등
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const saved = await res.json();
                return {
                  ...m,
                  history_id: saved.history_id,                           // ✅ snake_case
                  medi_name: saved.prod_name ?? saved.custom_name ?? m.medi_name,
                };
              }
            })
          );
      
          setMedications(newMedications);
          Alert.alert('성공', '복약 이력이 업데이트되었습니다.');
          onUpdate?.();
        } catch (err) {
          console.error(err);
          Alert.alert('오류', '복약 이력 업데이트에 실패했습니다.');
        }
      };


    return (
        <KeyboardAwareScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 50 }}
            enableOnAndroid={true}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <Text style={styles.backButtonText}>‹ 뒤로</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>건강 정보</Text>
            </View>

            {/* 질병 정보 */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>기저질환 정보</Text>
                <View style={{ maxHeight: 300 }}>
                    <ScrollView>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                            {DISEASES.map(disease => {
                                const selected = selectedDiseases.includes(disease.disease_id);
                                return (
                                    <TouchableOpacity key={disease.disease_id} style={styles.checkboxContainer} onPress={() => toggleDisease(disease.disease_id)}>
                                        <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                                            {selected && <Feather name="check" size={20} color="white" />}
                                        </View>
                                        <Text style={styles.checkboxLabel}>{disease.disease_name}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </ScrollView>
                </View>
                <TouchableOpacity style={styles.saveButton} onPress={handleDiseaseSave}>
                    <Text style={styles.saveButtonText}>저장</Text>
                </TouchableOpacity>
            </View>

            {/* 복용 이력 */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>복용 이력</Text>
                {medications.map((m, idx) => (
                    <View key={idx} style={styles.inputContainer}>
                        {/* 삭제 버튼 */}
                        <TouchableOpacity onPress={() => handleRemoveMedication(idx)} style={styles.removeButton}>
                            <Text style={styles.removeButtonText}>×</Text>
                        </TouchableOpacity>

                        {/* 약물명 */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>약물명</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="약물명을 입력해주세요"
                                placeholderTextColor="#999"
                                value={m.medi_name}
                                onChangeText={(t) => handleMedicationChange(idx, 'medi_name', t)}
                            />
                        </View>

                        {/* 시작일/종료일 */}
                        <View style={styles.dateRow}>
                            {['start_date', 'end_date'].map(field => (
                                <View style={styles.dateInputGroup} key={field}>
                                    <Text style={styles.inputLabel}>{field === 'start_date' ? '시작일' : '종료일'}</Text>
                                    <TouchableOpacity
                                        style={styles.dateInput}
                                        onPress={() => openDateModal(idx, field as 'start_date' | 'end_date')}
                                    >
                                        <Text style={[styles.dateText, !m[field as 'start_date' | 'end_date'] && styles.placeholderText]}>
                                            {m[field as 'start_date' | 'end_date'] ? formatDate(m[field as 'start_date' | 'end_date'] ?? '') : '날짜 선택'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>

                        {/* 상태 */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>현재 복용 여부</Text>
                            <View style={styles.radioContainer}>
                                {['복용중', '복용완료'].map(status => (
                                    <TouchableOpacity
                                        key={status}
                                        style={[styles.radioButton, m.status === status && styles.radioSelected]}
                                        onPress={() => handleMedicationChange(idx, 'status', status)}
                                    >
                                        <Text style={[styles.radioText, m.status === status && styles.radioTextSelected]}>
                                            {status}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* 복용량 */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>복용량</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="예: 1일 2회 100mg"
                                placeholderTextColor="#999"
                                value={m.dosage}
                                onChangeText={(t) => handleMedicationChange(idx, 'dosage', t)}
                                textContentType="none"
                            />
                        </View>
                    </View>
                ))}

                <TouchableOpacity style={styles.addButton} onPress={handleAddMedication}>
                    <Text style={styles.addButtonText}>+ 추가</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.saveButton, { marginTop: 10 }]} onPress={handleMedicationSave}>
                    <Text style={styles.saveButtonText}>저장</Text>
                </TouchableOpacity>
            </View>

            {/* 날짜 선택 모달 */}
            <Modal visible={showDateModal} transparent animationType="slide" onRequestClose={() => setShowDateModal(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity onPress={() => setShowDateModal(false)} style={styles.modalButton}>
                                <Text style={styles.modalButtonText}>취소</Text>
                            </TouchableOpacity>
                            <Text style={styles.modalTitle}>{dateField === 'start_date' ? '시작일 선택' : '종료일 선택'}</Text>
                            <TouchableOpacity onPress={handleDateConfirm} style={styles.modalButton}>
                                <Text style={[styles.modalButtonText, styles.confirmText]}>확인</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.datePickerContainer}>
                            <View style={styles.datePickerColumn}>
                                <Text style={styles.columnLabel}>년</Text>
                                <ScrollPicker data={years} selectedValue={dateComponents.year} onValueChange={handleYearChange} />
                            </View>
                            <View style={styles.datePickerColumn}>
                                <Text style={styles.columnLabel}>월</Text>
                                <ScrollPicker data={months} selectedValue={dateComponents.month} onValueChange={handleMonthChange} />
                            </View>
                            <View style={styles.datePickerColumn}>
                                <Text style={styles.columnLabel}>일</Text>
                                <ScrollPicker data={days} selectedValue={dateComponents.day} onValueChange={handleDayChange} />
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </KeyboardAwareScrollView>
    );
};



const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFCF9',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        marginTop: 20,
        marginHorizontal: 20,
    },
    backButton: {
        marginRight: 15,
    },
    backButtonText: {
        fontSize: 18,
        color: '#007AFF',
        fontWeight: '600',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    section: {
        marginTop: 20,
        marginHorizontal: 20,
        backgroundColor: '#fff',
        padding: 20,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 15,
    },
    saveButton: {
        alignSelf: 'flex-end',
        width: 60,
        backgroundColor: '#007AFF',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 15,
    },
    saveButtonText: {
        textAlign: 'center',
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '48%',
        marginBottom: 16,
        padding: 12,
        borderWidth: 2,
        borderColor: '#FF6600',
        borderRadius: 8,
        backgroundColor: '#fff',
    },
    checkbox: {
        width: 24,
        height: 24,
        borderWidth: 2,
        borderColor: '#FF6600',
        borderRadius: 6,
        marginRight: 6,
    },
    checkboxSelected: {
        backgroundColor: '#FF6600'
    },
    checkboxLabel: {
        fontSize: 16,
        color: '#333'
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
        fontSize: 13,
        color: '#333',
        flex: 1,
    },
    placeholderText: {
        color: '#999',
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
});

export default HealthInfoScreen;