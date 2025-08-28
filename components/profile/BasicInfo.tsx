import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  TextInput,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useAuth } from '../../contexts/AuthContext';
import { languages,InfoScreenProps } from '../../types/profile';
import { Feather } from '@expo/vector-icons';
import { BASE_URL } from '../../types/ip';
import i18n from "../../config/i18n";
import { t } from 'i18next';

const BasicInfoScreen: React.FC<InfoScreenProps> = ({ user, onBack, onUpdate }) => {
  const { token } = useAuth();

  // 상태로 관리
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [userImg, setUserImg] = useState(user?.user_img || '');
  const [language, setLanguage] = useState(user?.language || '');


  const [showDropdown, setShowDropdown] = useState(false);

  const handleSave = async () => {
    try {
      const res = await fetch(`${BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          nickname,
          phone,
          user_img: userImg,
          language,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      Alert.alert('성공', '프로필이 업데이트되었습니다.');
      if (onUpdate) {
        onUpdate();
      }
    } catch (err) {
      console.error(err);
      Alert.alert('오류', '프로필 업데이트에 실패했습니다.');
    }
  };

  const basicInfoData = [
    { label: '사용자 ID', value: user?.user_id || '-' },
    { label: '사용자명', value: user?.username || '-' },
    { label: '성별', value: user?.gender || '-' },
    { label: '이메일', value: user?.email || '-' },
    { label: '생년월일', value: user?.birthday || '-' },
    { label: '국가', value: user?.country || '-' },
    { label: '거주지', value: user?.residence || '-' },
  ];

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 30 }}
      enableOnAndroid={true}
      extraScrollHeight={20}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>‹ 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('User.basicInfo.title')}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>닉네임</Text>
          <TextInput
            style={styles.textInput}
            value={nickname}
            onChangeText={setNickname}
          />
        </View>

        <View style={[styles.dropdownContainer, { zIndex: 1000 }]}>
          <Text style={styles.inputLabel}>언어</Text>
          <TouchableOpacity style={styles.dropdownTitle} onPress={() => setShowDropdown(!showDropdown)}>
            <Text style={styles.dropdownText}>
              {languages.find(l => l.code === language)?.flag || '🌐'}
              {languages.find(l => l.code === language)?.name || '언어 선택'}
            </Text>
            <Feather
              name={showDropdown ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#333"
            />
          </TouchableOpacity>

          {showDropdown && (
            <View style={styles.dropdown}>
              {languages.map(lang => (
                <TouchableOpacity
                  key={lang.code}
                  style={styles.dropdownList}
                  onPress={() => { 
                    setLanguage(lang.code);
                    setShowDropdown(false); 
                    i18n.changeLanguage(lang.code);
                  }}
                >
                  <Text style={styles.dropdownText}>{lang.flag} {lang.name}</Text>
                  {language === lang.code && (
                    <Feather
                      name="check"
                      size={20}
                      color="#007AFF"
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>전화번호</Text>
          <TextInput
            style={styles.textInput}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>프로필 이미지 URL</Text>
          <TextInput
            style={styles.textInput}
            value={userImg}
            onChangeText={setUserImg}
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>저장</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        {basicInfoData.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.tableLabel}>{item.label}</Text>
            <Text style={styles.tableValue}>{item.value}</Text>
          </View>
        ))}
      </View>
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
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
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
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tableLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    flex: 1,
  },
  tableValue: {
    fontSize: 16,
    color: '#333',
    flex: 2,
    textAlign: 'right',
  },
  dropdownContainer: {
    marginBottom: 20,
  },
  dropdownTitle: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  dropdown: {
    position: 'absolute',
    width: '100%',
    top: 75,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    borderRadius: 8,
    minHeight: 50,
    paddingHorizontal: 15,
    borderWidth: 1,
  },
  dropdownList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderBottomWidth: 1,
    maxHeight: 200,
    paddingVertical: 12,
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
  },
});

export default BasicInfoScreen;