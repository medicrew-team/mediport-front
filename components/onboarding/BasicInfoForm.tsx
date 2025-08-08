import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useOnboarding } from '../../contexts/OnboardingContext';

export default function BasicInfoForm() {
  const { data, updateData, nextStep, previousStep } = useOnboarding();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [formData, setFormData] = useState({
    name: data.name,
    nickname: data.nickname,
    gender: data.gender,
    birthDate: data.birthDate,
  });

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

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const dateString = selectedDate.toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, birthDate: dateString }));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity onPress={previousStep} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.stepText}>1/5</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>기본 정보를 입력해주세요</Text>
          
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>이름 *</Text>
              <TextInput
                style={styles.input}
                placeholder="실명을 입력해주세요"
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>닉네임 *</Text>
              <TextInput
                style={styles.input}
                placeholder="사용하실 닉네임을 입력해주세요"
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
                    onPress={() => setFormData(prev => ({ ...prev, gender: option.key as any }))}
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
                onPress={() => setShowDatePicker(true)}
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
      </ScrollView>

      {showDatePicker && (
        <DateTimePicker
          value={formData.birthDate ? new Date(formData.birthDate) : new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
    color: '#007AFF',
  },
  stepText: {
    fontSize: 16,
    color: '#666',
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
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  genderButtonText: {
    fontSize: 16,
    color: '#333',
  },
  selectedGenderText: {
    color: '#007AFF',
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
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});