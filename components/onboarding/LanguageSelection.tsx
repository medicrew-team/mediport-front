import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useOnboarding } from '../../contexts/OnboardingContext';
import i18n from "../../config/i18n";

const languages = [
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'zh-CN', name: '中文', flag: '🇨🇳' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'th', name: 'ไทย', flag: '🇹🇭' },
  { code: 'fil', name: 'Filipino', flag: '🇵🇭' },
];

export default function LanguageSelection() {
  const { data, updateData, nextStep } = useOnboarding();
  const [selectedLanguage, setSelectedLanguage] = useState(data.language);

  const handleNext = () => {
    if (selectedLanguage) {
      updateData({ language: selectedLanguage });
      i18n.changeLanguage(selectedLanguage);
      nextStep();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Select Language</Text>
        <Text style={styles.subtitle}>Select the language of the text {'\n'} you see on our app</Text>
        
        <View style={styles.languageList}>
          {languages.map((language) => (
            <TouchableOpacity
              key={language.code}
              style={[
                styles.languageItem,
                selectedLanguage === language.code && styles.selectedLanguage
              ]}
              onPress={() => setSelectedLanguage(language.code)}
            >
              <Text style={styles.flag}>{language.flag}</Text>
              <Text style={[
                styles.languageName,
                selectedLanguage === language.code && styles.selectedLanguageName
              ]}>
                {language.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <TouchableOpacity
          style={[
            styles.nextButton,
            !selectedLanguage && styles.disabledButton
          ]}
          onPress={handleNext}
          disabled={!selectedLanguage}
        >
          <Text style={[
            styles.nextButtonText,
            !selectedLanguage && styles.disabledButtonText
          ]}>
            NEXT
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFCF9',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    color: '#666',
  },
  languageList: {
    marginBottom: 40,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  selectedLanguage: {
    borderColor: '#FF6600',
    backgroundColor: '#fffae6',
  },
  flag: {
    fontSize: 24,
    marginRight: 16,
  },
  languageName: {
    fontSize: 18,
    color: '#333',
  },
  selectedLanguageName: {
    color: '#FF6600',
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#FF6600',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledButtonText: {
    color: '#999',
  },
});