import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useAuth } from '../../contexts/AuthContext';
import { BASE_URL } from '../../types/ip';
import { InfoScreenProps } from '../../types/profile';

// 질병 목록 상수
const DISEASES = [
  { disease_id: 1, disease_name: '고혈압' },
  { disease_id: 2, disease_name: '당뇨병' },
  { disease_id: 3, disease_name: '고지혈증' },
  { disease_id: 4, disease_name: '심부전' },
  { disease_id: 5, disease_name: '협심증' },
  { disease_id: 6, disease_name: '뇌졸증' },
  { disease_id: 7, disease_name: '통풍' },
  { disease_id: 8, disease_name: '천식' },
  { disease_id: 9, disease_name: '관절염' },
];

const CautionInfoScreen: React.FC<InfoScreenProps> = ({ user, onBack, onUpdate }) => {
  const { token } = useAuth();
  const [selectedDiseases, setSelectedDiseases] = useState<number[]>([]);
  const [prohibitMedi, setProhibitMedi] = useState<{ medi_name: string; prohibit_reason: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.diseases) setSelectedDiseases(user.diseases.map(d => d.id));
  }, [user]);

  const fetchProhibitMedi = async (diseaseId: number) => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/users/profile/diseases/${diseaseId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setProhibitMedi(data.prohibited_medications || []);
    } catch (err) {
      console.error(err);
      Alert.alert('오류', '금기 약물 정보를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: 50 }}
      enableOnAndroid={true}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>‹ 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>병용 금지</Text>
      </View>

      {/* 선택된 질환 컨테이너 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>선택된 기저질환</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {selectedDiseases.map(id => {
            const disease = DISEASES.find(d => d.disease_id === id);
            if (!disease) return null;
            return (
              <TouchableOpacity
                key={id}
                style={styles.selectedDiseaseButton}
                onPress={() => fetchProhibitMedi(id)}
              >
                <Text style={styles.selectedDiseaseText}>{disease.disease_name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 금기 약물 정보 표시 */}
      {prohibitMedi.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>금기 약물 정보</Text>
          {loading ? (
            <Text>불러오는 중...</Text>
          ) : (
            prohibitMedi.map((m, idx) => (
              <View key={idx} style={styles.mediRow}>
                <Text style={styles.mediName}>{m.medi_name}</Text>
                <Text style={styles.mediReason}>{m.prohibit_reason}</Text>
              </View>
            ))
          )}
        </View>
      )}
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  selectedDiseaseButton: {
    backgroundColor: '#FF6600',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    margin: 5,
  },
  selectedDiseaseText: {
    color: '#fff',
    fontWeight: '600',
  },
  mediRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  mediName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  mediReason: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});

export default CautionInfoScreen;
