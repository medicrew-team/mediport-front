import React, { useState } from 'react';
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useOnboarding } from '../../contexts/OnboardingContext';
import CountryPicker from './CountryPicker';

export default function LocationContactForm() {
  const { data, updateData, nextStep, previousStep } = useOnboarding();
  const [nationality, setNationality] = useState(data.nationality || '대한민국');
  const [countryCode, setCountryCode] = useState(data.countryCode || '+82');
  const [phone, setPhone] = useState(data.phone);
  const [residence, setResidence] = useState(data.residence);

  const countries = ['대한민국', '중국', '미국', '베트남', '필리핀', '태국', '기타'];

  const handleNext = () => {
    if (!nationality) {
      Alert.alert('알림', '국적을 선택해주세요.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 7) { // 최소 7자리 (국가코드 제외)
      Alert.alert('알림', '유효한 전화번호를 입력해주세요.');
      return;
    }
    if (!residence.trim()) {
      Alert.alert('알림', '거주 지역을 입력해주세요.');
      return;
    }

    updateData({
      nationality,
      countryCode,
      phone: phone.trim(),
      residence: residence.trim(),
    });
    nextStep();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        enableOnAndroid={true}
        extraScrollHeight={50}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        enableResetScrollToCoords={false}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={previousStep} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>연락처 및 거주지 정보</Text>
          <Text style={styles.subtitle}>
            정확한 정보 입력을 부탁드립니다.
          </Text>
          
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>국적 *</Text>
              <CountryPicker
                selectedCountry={nationality}
                onCountrySelect={setNationality}
                countries={countries}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>전화번호 *</Text>
              <View style={styles.phoneContainer}>
                <Text style={styles.plusSign}>+</Text>
                <TextInput
                  style={styles.countryCodeInput}
                  placeholder="82"
                  placeholderTextColor="#999"
                  value={countryCode.replace('+', '')}
                  onChangeText={(text) => setCountryCode('+' + text.replace(/[^0-9]/g, ''))}
                  keyboardType="phone-pad"
                  maxLength={4}
                />
                <TextInput
                  style={styles.phoneInput}
                  placeholder="전화번호 (숫자만 입력)"
                  placeholderTextColor="#999"
                  value={phone}
                  onChangeText={(text) => setPhone(text.replace(/[^0-9]/g, ''))}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>거주 지역 *</Text>
              <TextInput
                style={styles.input}
                placeholder="예: 서울시 강남구"
                placeholderTextColor="#999"
                value={residence}
                onChangeText={setResidence}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>다음</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  phoneContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  plusSign: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  countryCodeInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    width: 70, // 국가 코드 입력 필드 너비 조정
    textAlign: 'center',
  },
  phoneInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    flex: 1,
  },
  nextButton: {
    backgroundColor: '#FF6600',
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
