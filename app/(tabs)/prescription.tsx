import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../contexts/AuthContext';
import { BASE_URL } from '../../types/ip';
import { t } from 'i18next';

export default function PrescriptionScreen() {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const navigateToAlternative = () => {
    router.push('/alternative');
  };

  const navigateToPrescription = () => {
    router.push('/prescription');
  };

  const navigateToProhibited = () => {
    router.push('/prohibited');
  };

  const handleCamera = async () => {
    try {
      // 카메라 권한 요청
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('User.alert.Permission'), t('User.alert.camera_permission'));
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert(t('User.alert.error'), t('User.alert.camera_error'));
    }
  };

  // 갤러리에서 선택
  const handleGallery = async () => {
    try {
      // 갤러리 권한 요청
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('User.alert.Permission'), t('User.alert.gallery_permission'));
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert(t('User.alert.error'), t('User.alert.gallery_error'));
    }
  };

  // 이미지 업로드
  const uploadImage = async (imageAsset: any) => {
    try {
      setIsLoading(true);

      const formData = new FormData();
      formData.append('file', {
        uri: imageAsset.uri,
        type: 'image/jpeg',
        name: 'prescription.jpg',
      } as any);

      const response = await fetch(`${BASE_URL}/prescription/korean-medicine/image`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert(t('User.alert.success'), t('User.alert.find_success'), [
          {
            text: '확인',
            onPress: () => {
              console.log('처방약 분석결과', data);
              router.push({
                pathname: "/pharmacy",
                params: {
                  results: JSON.stringify(data),
                  inputImage: imageAsset.uri,
                },
              });
            }
          }
        ]);
      } else {
        throw new Error(data.message || t('User.alert.find_fail'));
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert(t('User.alert.error'), t('User.alert.find_error'));
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <ScrollView style={styles.container}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.navButton, styles.inactiveButton]}
          onPress={navigateToAlternative}
        >
          <Text style={[styles.buttonText, styles.inactiveButtonText]}>{t('User.prescription.btn_alternative')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, styles.inactiveButton]}
          onPress={navigateToProhibited}
        >
          <Text style={[styles.buttonText, styles.inactiveButtonText]}>{t('User.prescription.btn_prohibited')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, styles.activeButton]}
          onPress={navigateToPrescription}
        >
          <Text style={[styles.buttonText, styles.activeButtonText]}>{t('User.prescription.btn_prescription')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}><FontAwesome name="lightbulb-o" size={18} color="#A97C5E" />{t('User.prescription.tip')}</Text>
      </View>
      <View style={styles.iconContainer}>
        <Image
          source={require('../../assets/images/medicamera.png')}
          style={{ width: 200, height: 200 }}
        />
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('User.prescription.title')}</Text>
        <Text style={styles.sectionSubtitle}>{t('User.prescription.subtitle')}</Text>

        {/* 옵션 버튼들 */}
        <TouchableOpacity
          style={styles.optionButton}
          onPress={handleCamera}
          disabled={isLoading}
        >
          <View style={styles.optionIconContainer}>
            <View style={[styles.optionIcon, { backgroundColor: '#E8F5E8' }]}>
              <Ionicons name="camera" size={24} color="#4CAF50" />
            </View>
          </View>
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle}>{t('User.prescription.option1')}</Text>
            <Text style={styles.optionSubtitle}>{t('User.prescription.sub1')}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#C0C0C0" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionButton}
          onPress={handleGallery}
          disabled={isLoading}
        >
          <View style={styles.optionIconContainer}>
            <View style={[styles.optionIcon, { backgroundColor: '#E3F2FD' }]}>
              <MaterialIcons name="photo-library" size={24} color="#2196F3" />
            </View>
          </View>
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle}>{t('User.prescription.option2')}</Text>
            <Text style={styles.optionSubtitle}>{t('User.prescription.sub2')}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#C0C0C0" />
        </TouchableOpacity>
      </View>

      {/* 로딩 오버레이 */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF6B35" />
            <Text style={styles.loadingText}>{t('User.prescription.loading')}</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFCF9',
  },
  section: {
    marginHorizontal: 20,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 30,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  navButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginHorizontal: 5,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeButton: {
    backgroundColor: '#FF6B35',
  },
  inactiveButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activeButtonText: {
    color: '#fff',
  },
  inactiveButtonText: {
    color: '#FF6B35',
  },

  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 8,
    marginBottom: 12,
  },
  optionIconContainer: {
    marginRight: 16,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  infoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 30,
    marginHorizontal: 40,
    backgroundColor: '#FEFAE9',
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: '#FAEBAF',
  },
  infoText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#A97C5E',
    fontWeight: '500',
    lineHeight: 20,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContainer: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#333',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});