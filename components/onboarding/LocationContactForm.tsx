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
import { t } from 'i18next';

export default function LocationContactForm() {
  const { data, updateData, nextStep, previousStep } = useOnboarding();
  const [nationality, setNationality] = useState(data.nationality || t('onboarding.countries.korea'));
  const [countryCode, setCountryCode] = useState(data.countryCode || '+82');
  const [phone, setPhone] = useState(data.phone);
  const [residence, setResidence] = useState(data.residence);

  const countries = [t('onboarding.countries.korea'), t('onboarding.countries.china'), t('onboarding.countries.english'), t('onboarding.countries.vietnam'), t('onboarding.countries.philippines'), t('onboarding.countries.thailand'), t('onboarding.countries.others')];

  const handleNext = () => {
    if (!nationality) {
      Alert.alert(t('onboarding.alert.title'), t('onboarding.alert.nationality?'));
      return;
    }
    if (!phone.trim() || phone.trim().length < 7) { // 최소 7자리 (국가코드 제외)
      Alert.alert(t('onboarding.alert.title'), t('onboarding.alert.phone?'));
      return;
    }
    if (!residence.trim()) {
      Alert.alert(t('onboarding.alert.title'), t('onboarding.alert.residence?'));
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
          <Text style={styles.title}>{t('onboarding.locationContact.title')}</Text>
          <Text style={styles.subtitle}>
            {t('onboarding.locationContact.subtitle')}
          </Text>
          
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('onboarding.locationContact.nationality')}</Text>
              <CountryPicker
                selectedCountry={nationality}
                onCountrySelect={setNationality}
                countries={countries}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('onboarding.locationContact.phone')}</Text>
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
                  placeholder={t('onboarding.locationContact.phoneplaceholder')}
                  placeholderTextColor="#999"
                  value={phone}
                  onChangeText={(text) => setPhone(text.replace(/[^0-9]/g, ''))}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('onboarding.locationContact.residence')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('onboarding.locationContact.residenceplaceholder')}
                placeholderTextColor="#999"
                value={residence}
                onChangeText={setResidence}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>{t('onboarding.locationContact.next')}</Text>
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
