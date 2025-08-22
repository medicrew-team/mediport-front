import React, { useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useOnboarding } from '../../contexts/OnboardingContext';


interface Medication {
  medi_name: string;
  start_date: string;
  end_date: string;
  status: string;  // '복용중' | '복용완료'
  dosage: string;
}

export default function MedicationsForm() {
  const { data, updateData, nextStep, previousStep } = useOnboarding();

  const [showStartPicker, setShowStartPicker] = useState<number | null>(null);
  const [showEndPicker, setShowEndPicker] = useState<number | null>(null);
  const handleDateChange = (index: number, field: 'start_date' | 'end_date', selectedDate: Date) => {
    handleChange(index, field, selectedDate.toISOString().split('T')[0]);
  };


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

  const addRow = () => {
    setMedications([...medications, { medi_name: '', start_date: '', end_date: '', status: '', dosage: '' }]);
  };
  const removeRow = (index: number) => {
    const updated = [...medications];
    updated.splice(index, 1);
    setMedications(updated);
  };

  const handleNext = () => {
    updateData({ medications });
    nextStep();
  };

  const handleSkip = () => {
    updateData({ medications: [] });
    nextStep();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
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
                <TouchableOpacity
                  onPress={() => removeRow(idx)}
                  style={styles.removeButton}
                >
                  <Text style={styles.removeButtonText}>X</Text>
                </TouchableOpacity>
                <TextInput
                  style={styles.input}
                  placeholder="약물명"
                  placeholderTextColor="#666"
                  value={m.medi_name}
                  onChangeText={(t) => handleChange(idx, 'medi_name', t)}
                />
                <TouchableOpacity onPress={() => setShowStartPicker(idx)} style={styles.input}>
                  <Text style={{ color: m.start_date ? '#000' : '#666' }}>
                    {m.start_date || '시작일 (YYYY-MM-DD)'}
                  </Text>
                </TouchableOpacity>
                {showStartPicker === idx && (
                  <DateTimePicker
                    value={m.start_date ? new Date(m.start_date) : new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, date) => {
                      setShowStartPicker(null);
                      if (date) handleDateChange(idx, 'start_date', date);
                    }}
                  />
                )}

                <TouchableOpacity onPress={() => setShowEndPicker(idx)} style={styles.input}>
                  <Text style={{ color: m.end_date ? '#000' : '#666' }}>
                    {m.end_date || '종료일 (YYYY-MM-DD)'}
                  </Text>
                </TouchableOpacity>
                {showEndPicker === idx && (
                  <DateTimePicker
                    value={m.end_date ? new Date(m.end_date) : new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, date) => {
                      setShowEndPicker(null);
                      if (date) handleDateChange(idx, 'end_date', date);
                    }}
                  />
                )}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Text>현재 복용 여부 : </Text>
                  <TouchableOpacity
                    style={m.status === '복용중' ? styles.radioSelected : styles.radio}
                    onPress={() => handleChange(idx, 'status', '복용중')}
                  >
                    <Text>복용중</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={m.status === '복용완료' ? styles.radioSelected : styles.radio}
                    onPress={() => handleChange(idx, 'status', '복용완료')}
                  >
                    <Text>복용완료</Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="복용량 (예: 1일 2회 100mg)"
                  placeholderTextColor="#666"
                  value={m.dosage}
                  onChangeText={(t) => handleChange(idx, 'dosage', t)}
                />
              </View>
            ))}
            <TouchableOpacity onPress={addRow} style={styles.addButton}>
              <Text style={{ color: '#FF6600', fontWeight: 'bold' }}>+ 행 추가</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>다음</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>건너뛰기</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFCF9',
  },
  scrollView: {
    flex: 1,
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
    paddingTop: 50,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    position: 'relative',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
    backgroundColor: '#fefefe',
  },
  addButton: {
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF6600',
    borderRadius: 8,
    marginBottom: 24,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF6600',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  removeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  radio: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  radioSelected: {
    borderWidth: 1,
    borderColor: '#FF6600',
    backgroundColor: '#FFE5D4',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginRight: 8,
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
});
