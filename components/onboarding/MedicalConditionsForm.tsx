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
import { t } from 'i18next';

// 질병 목록 상수
export const DISEASES = [
  { disease_id: 1, disease_name: t('DISEASES.1') },
  { disease_id: 2, disease_name: t('DISEASES.2') },
  { disease_id: 3, disease_name: t('DISEASES.3') },
  { disease_id: 4, disease_name: t('DISEASES.4') },
  { disease_id: 5, disease_name: t('DISEASES.5') },
  { disease_id: 6, disease_name: t('DISEASES.6') },
  { disease_id: 7, disease_name: t('DISEASES.7') },
  { disease_id: 8, disease_name: t('DISEASES.8') },
  { disease_id: 9, disease_name: t('DISEASES.9') },
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
          <Text style={styles.title}>{t('onboarding.MedicalConditions.title')}</Text>
          <Text style={styles.subtitle}>
            {t('onboarding.MedicalConditions.subtitle')}
          </Text>

          <View style={{ maxHeight: 300 }}>
            <ScrollView>
              <View style={styles.form}>
                {[1,2,3,4,5,6,7,8,9].map((id) => {
                  const selected = medicalConditions.includes(id);
                  return (
                    <TouchableOpacity
                      key={id}
                      style={[
                        styles.checkboxContainer
                      ]}
                      onPress={() => toggleDisease(id)}
                    >
                      <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                        {selected && <Feather name="check" size={20} color="white" />}
                      </View>
                      <Text style={styles.checkboxLabel}>{t(`DISEASES.${id}`)}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>

          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>{t('onboarding.MedicalConditions.next')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>{t('onboarding.MedicalConditions.skip')}</Text>
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
    marginRight: 6,
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
