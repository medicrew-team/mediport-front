import React, { useState } from 'react';
import { Alert, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import CountryPicker from './CountryPicker'; // 새로운 커스텀 컴포넌트

interface SignupFormProps {
  onSignup: (email: string, password: string, name: string, phone: string, country: string) => void;
  onSwitchToLogin: () => void;
}

export default function SignupForm({ onSignup, onSwitchToLogin }: SignupFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('대한민국');

  const countries = ['대한민국', '중국', '미국', '베트남', '필리핀', '태국', '기타'];

  const handleSignup = () => {
    if (!email || !password || !confirmPassword || !name || !phone || !country) {
      Alert.alert('오류', '모든 항목을 입력해주세요.');
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('오류', '비밀번호가 일치하지 않습니다.');
      return;
    }
    
    onSignup(email, password, name, phone, country);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>회원가입</Text>
      
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="이름"
          placeholderTextColor="#999"
          value={name}
          onChangeText={setName}
        />
        
        <TextInput
          style={styles.input}
          placeholder="이메일"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <TextInput
          style={styles.input}
          placeholder="전화번호"
          placeholderTextColor="#999"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        {/* 국가 선택 */}
        <View style={styles.fieldContainer}>
          <CountryPicker
            selectedCountry={country}
            onCountrySelect={setCountry}
            countries={countries}
          />
        </View>
        
        <TextInput
          style={styles.input}
          placeholder="비밀번호"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <TextInput
          style={styles.input}
          placeholder="비밀번호 확인"
          placeholderTextColor="#999"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
        
        <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
          <Text style={styles.signupButtonText}>회원가입</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.switchButton} onPress={onSwitchToLogin}>
          <Text style={styles.switchButtonText}>
            이미 계정이 있으신가요? 로그인
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
    color: '#333',
  },
  form: {
    gap: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  fieldContainer: {
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 0 : 4,
  },
  pickerLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    marginBottom: Platform.OS === 'ios' ? 0 : -8,
  },
  picker: {
    height: Platform.OS === 'ios' ? 120 : 50,
    width: '100%',
    color: '#333',
  },
  signupButton: {
    backgroundColor: '#34C759',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  switchButton: {
    marginTop: 16,
    padding: 8,
  },
  switchButtonText: {
    color: '#007AFF',
    fontSize: 16,
    textAlign: 'center',
  },
});