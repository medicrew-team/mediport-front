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
import { InfoScreenProps } from '../../types/profile';
import { BASE_URL } from '../../types/ip';
import { t } from 'i18next';

const BasicInfoScreen: React.FC<InfoScreenProps> = ({ user, onBack, onUpdate }) => {
  const { token } = useAuth();

  // 상태로 관리
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [userImg, setUserImg] = useState(user?.user_img || '');

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
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      Alert.alert(t('User.alert.success'), t('User.alert.profile_update'));
      if (onUpdate) {
        onUpdate();
      }
    } catch (err) {
      console.error(err);
      Alert.alert(t('User.alert.error'), t('User.alert.profile_update_fail'));
    }
  };

  const basicInfoData = [
    { label: t('User.basicInfo.data_id'), value: user?.user_id || '-' },
    { label: t('User.basicInfo.data_name'), value: user?.username || '-' },
    { label: t('User.basicInfo.data_gender'), value: user?.gender || '-' },
    { label: t('User.basicInfo.data_email'), value: user?.email || '-' },
    { label: t('User.basicInfo.data_birthday'), value: user?.birthday || '-' },
    { label: t('User.basicInfo.data_country'), value: user?.country || '-' },
    { label: t('User.basicInfo.data_residence'), value: user?.residence || '-' },
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
          <Text style={styles.backButtonText}>{t('User.basicInfo.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('User.basicInfo.title')}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>{t('User.basicInfo.nickname')}</Text>
          <TextInput
            style={styles.textInput}
            value={nickname}
            onChangeText={setNickname}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>{t('User.basicInfo.phone')}</Text>
          <TextInput
            style={styles.textInput}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>{t('User.basicInfo.img_url')}</Text>
          <TextInput
            style={styles.textInput}
            value={userImg}
            onChangeText={setUserImg}
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>{t('User.basicInfo.save')}</Text>
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
});

export default BasicInfoScreen;