import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { Feather } from '@expo/vector-icons';
const DISEASES = [
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

export default function MedicalConditionsForm() {
  const { data, updateData, nextStep, previousStep } = useOnboarding();

  const [medicalConditions, setMedicalConditions] = useState<number[]>(
    Array.isArray(data.medicalConditions)
      ? data.medicalConditions.map((d: any) =>
          typeof d === 'number' ? d : d.id || d.disease_id
        )
      : []
  );

  const toggleDisease = (id: number) => {
    setMedicalConditions((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    updateData({ medicalConditions });
    nextStep();
  };

  const handleSkip = () => {
    updateData({ medicalConditions: [] }); // 스킵 시 빈 값으로 저장
    nextStep();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity onPress={previousStep} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>기저질환 정보</Text>
          <Text style={styles.subtitle}>
            앓고 계신 기저질환이 있다면 입력해주세요.{'\n'}(선택 사항)
          </Text>

          <View style={{ maxHeight: 300 }}>
            <ScrollView>
              <View style={styles.form}>
                {DISEASES.map((disease) => {
                  const selected = medicalConditions.includes(disease.disease_id);
                  return (
                    <TouchableOpacity
                      key={disease.disease_id}
                      style={[
                        styles.checkboxContainer
                      ]}
                      onPress={() => toggleDisease(disease.disease_id)}
                    >
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
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
    marginRight: 12,
  },
  checkboxSelected: {
    backgroundColor: '#FF6600'
  },
  checkboxLabel: {
    fontSize: 16, color: '#333'
  },
  nextButton: {
    backgroundColor: '#FF6600',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
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
