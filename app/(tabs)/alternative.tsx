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

export default function AlternativeScreen() {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showTextModal, setShowTextModal] = useState(false);
  const [medicineText, setMedicineText] = useState('');

  const navigateToAlternative = () => {
    router.push('/alternative');
  };

  const navigateToPrescription = () => {
    router.push('/prescription');
  };

  const navigateToProhibited = () => {
    router.push('/prohibited');
  };

  // 카메라로 촬영
  const handleCamera = async () => {
    try {
      // 카메라 권한 요청
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('권한 필요', '카메라 사용을 위해 권한이 필요합니다.');
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
      Alert.alert('오류', '카메라 실행 중 오류가 발생했습니다.');
    }
  };

  // 갤러리에서 선택
  const handleGallery = async () => {
    try {
      // 갤러리 권한 요청
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('권한 필요', '갤러리 사용을 위해 권한이 필요합니다.');
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
      Alert.alert('오류', '갤러리 실행 중 오류가 발생했습니다.');
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

      const response = await fetch(`${BASE_URL}/similar/foreign-medicine/image`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('성공', '성공적으로 분석되었습니다.', [
          {
            text: '확인', onPress: () => {
              console.log('유사약 분석결과', data);
              router.push({
                pathname: "/similar",
                params: { 
                  results: JSON.stringify(data),
                  inputImage: imageAsset.uri,
                },
              });
            }
          }
        ]);
      } else {
        throw new Error(data.message || '분석에 실패했습니다.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('오류', '분석 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 텍스트로 약품 검색
  const handleTextSearch = async () => {
    if (!medicineText.trim()) {
      Alert.alert('알림', '약품명을 입력해주세요.');
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(`${BASE_URL}/similar/foreign-medicine/text`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: medicineText.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const searchText = medicineText.trim(); // 검색한 텍스트 저장
        setShowTextModal(false);
        setMedicineText('');
        
        Alert.alert('성공', '약품 정보가 성공적으로 조회되었습니다.', [
          {
            text: '확인', onPress: () => {
              console.log('Medicine search result:', data);
              router.push({
                pathname: "/similar",
                params: { 
                  results: JSON.stringify(data),
                  inputText: searchText, // 검색한 텍스트 전달
                },
              });
            }
          }
        ]);
      } else {
        throw new Error(data.message || '검색에 실패했습니다.');
      }
    } catch (error) {
      console.error('Text search error:', error);
      Alert.alert('오류', '약품 검색 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.navButton, styles.activeButton]}
          onPress={navigateToAlternative}
        >
          <Text style={[styles.buttonText, styles.activeButtonText]}>유사약품 조회</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navButton, styles.inactiveButton]}
          onPress={navigateToProhibited}
        >
          <Text style={[styles.buttonText, styles.inactiveButtonText]}>반입금지 약품</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, styles.inactiveButton]}
          onPress={navigateToPrescription}
        >
          <Text style={[styles.buttonText, styles.inactiveButtonText]}>처방전 스캔</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.iconContainer}>
        <Image
          source={require('../../assets/images/meditrip.png')}
          style={{ width: 200, height: 200 }}
        />
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>유사 약품 정보 입력</Text>
        <Text style={styles.sectionSubtitle}>아래 방법 중 하나를 선택해주세요</Text>

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
            <Text style={styles.optionTitle}>카메라로 촬영</Text>
            <Text style={styles.optionSubtitle}>약품 이미지를 카메라로 촬영</Text>
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
            <Text style={styles.optionTitle}>갤러리에서 선택</Text>
            <Text style={styles.optionSubtitle}>약품 이미지를 갤러리에서 선택</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#C0C0C0" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => setShowTextModal(true)}
          disabled={isLoading}
        >
          <View style={styles.optionIconContainer}>
            <View style={[styles.optionIcon, { backgroundColor: '#F3E5F5' }]}>
              <MaterialIcons name="edit" size={24} color="#9C27B0" />
            </View>
          </View>
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle}>텍스트로 입력</Text>
            <Text style={styles.optionSubtitle}>약품 정보를 텍스트로 입력</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#C0C0C0" />
        </TouchableOpacity>
      </View>

      {/* 서비스 안내 */}
      <View style={styles.infoContainer}>
        <View style={styles.infoHeader}>
          <FontAwesome name="info-circle" size={20} color="#2196F3" />
          <Text style={styles.infoTitle}>매핑 서비스 안내</Text>
        </View>
        <View style={styles.infoContent}>
          <Text style={styles.infoText}>• 해외 약물과 성분이 유사한 국내 약물을 찾아드립니다</Text>
          <Text style={styles.infoText}>• 단, 복용 전엔 꼭 의사나 약사와 상담해주세요!</Text>
        </View>
      </View>

      {/* 로딩 오버레이 */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF6B35" />
            <Text style={styles.loadingText}>처리 중...</Text>
          </View>
        </View>
      )}

      {/* 텍스트 입력 모달 */}
      <Modal
        visible={showTextModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTextModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>약품 정보 직접 입력</Text>
              <TouchableOpacity
                onPress={() => setShowTextModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.textInput}
              placeholder="복용 중인 약품명을 입력하세요"
              placeholderTextColor="#999"
              value={medicineText}
              onChangeText={setMedicineText}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowTextModal(false)}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleTextSearch}
                disabled={isLoading}
              >
                <Text style={styles.confirmButtonText}>검색</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    fontSize: 14,
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
    marginTop: 20,
    marginHorizontal: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E3F2FD',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  infoContent: {
    paddingLeft: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 6,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    height: 120,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  confirmButton: {
    backgroundColor: '#FF6B35',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});