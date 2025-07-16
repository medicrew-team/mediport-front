import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ScanScreen() {
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = () => {
    setIsScanning(true);
    
    // 스캔 시뮬레이션 (실제로는 카메라 또는 이미지 처리)
    setTimeout(() => {
      setIsScanning(false);
      Alert.alert('스캔 완료', '약물 정보를 성공적으로 인식했습니다!');
    }, 2000);
  };

  const handleImageUpload = () => {
    Alert.alert('이미지 업로드', '갤러리에서 이미지를 선택하세요.');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>약물 스캔</Text>
      </View>

      <View style={styles.scanArea}>
        <View style={styles.scanFrame}>
          {isScanning ? (
            <View style={styles.scanningIndicator}>
              <Text style={styles.scanningText}>스캔 중...</Text>
              <View style={styles.spinner} />
            </View>
          ) : (
            <View style={styles.scanPlaceholder}>
              <Text style={styles.scanPlaceholderText}>📱</Text>
              <Text style={styles.scanInstructions}>
                약물 포장이나 처방전을{'\n'}카메라에 맞춰주세요
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.scanButton, isScanning && styles.scanButtonDisabled]}
          onPress={handleScan}
          disabled={isScanning}
        >
          <Text style={styles.scanButtonText}>
            {isScanning ? '스캔 중...' : '스캔 시작'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.uploadButton}
          onPress={handleImageUpload}
        >
          <Text style={styles.uploadButtonText}>갤러리에서 선택</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>스캔 가능한 항목</Text>
        <View style={styles.infoItem}>
          <Text style={styles.infoIcon}>💊</Text>
          <Text style={styles.infoText}>약물 포장 및 라벨</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoIcon}>📄</Text>
          <Text style={styles.infoText}>처방전 및 복용 지침</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoIcon}>🔍</Text>
          <Text style={styles.infoText}>약물 성분 정보</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  scanArea: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  scanFrame: {
    height: 300,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 12,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  scanningIndicator: {
    alignItems: 'center',
  },
  scanningText: {
    fontSize: 18,
    color: '#007AFF',
    marginBottom: 20,
  },
  spinner: {
    width: 30,
    height: 30,
    borderWidth: 3,
    borderColor: '#e0e0e0',
    borderTopColor: '#007AFF',
    borderRadius: 15,
    // 애니메이션은 실제 구현 시 추가
  },
  scanPlaceholder: {
    alignItems: 'center',
  },
  scanPlaceholderText: {
    fontSize: 48,
    marginBottom: 20,
  },
  scanInstructions: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    padding: 20,
    gap: 12,
  },
  scanButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  scanButtonDisabled: {
    backgroundColor: '#ccc',
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  uploadButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  uploadButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  infoSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#666',
  },
});