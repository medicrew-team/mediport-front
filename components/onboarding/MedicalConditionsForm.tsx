import React, { useState } from 'react';
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

export default function MedicalConditionsForm() {
  const { data, updateData, nextStep, previousStep } = useOnboarding();
  const [medicalConditions, setMedicalConditions] = useState(data.medicalConditions);

  const handleNext = () => {
    updateData({ medicalConditions: medicalConditions.trim() });
    nextStep();
  };

  const handleSkip = () => {
    updateData({ medicalConditions: '' }); // 스킵 시 빈 값으로 저장
    nextStep();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity onPress={previousStep} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.stepText}>5/6</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>기저질환 정보</Text>
          <Text style={styles.subtitle}>
            앓고 계신 기저질환이 있다면 입력해주세요. (선택 사항)
          </Text>
          
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>기저질환</Text>
              <TextInput
                style={styles.textArea}
                placeholder="예: 고혈압, 당뇨, 천식 등"
                placeholderTextColor="#999"
                value={medicalConditions}
                onChangeText={setMedicalConditions}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
    color: '#666',
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
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    minHeight: 120,
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
