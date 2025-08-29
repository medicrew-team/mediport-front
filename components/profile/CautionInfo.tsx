import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useAuth } from '../../contexts/AuthContext';
import { BASE_URL } from '../../types/ip';
import { InfoScreenProps } from '../../types/profile';
import { t } from 'i18next';

// 질병 목록 상수
const DISEASES = [
  { disease_id: 1, disease_name: t('DISEASES.1') },
  { disease_id: 2, disease_name: t('DISEASES.2') },
  { disease_id: 3, disease_name: t('DISEASES.3') },
  { disease_id: 4, disease_name: t('DISEASES.4') },
  { disease_id: 5, disease_name: t('DISEASES.5') },
  { disease_id: 6, disease_name: t('DISEASES.6') },
  { disease_id: 7, disease_name: t('DISEASES.7') },
  { disease_id: 8, disease_name: t('DISEASES.8') },
  { disease_id: 9, disease_name: t('DISEASES.9') },
];

interface ProhibitMedi {
  dur_chronic_id: number;
  dur_prod_name: string;
  ing_code: string;
  atc_code: string;
  atc_ing: string;
  caution: string;
  dur_prod_img: string;
}

const CautionInfoScreen: React.FC<InfoScreenProps> = ({ user, onBack }) => {
  const { token } = useAuth();
  const [selectedDiseases, setSelectedDiseases] = useState<number[]>([]);
  const [selectedDisease, setSelectedDisease] = useState<number | null>(null); // 추가: 현재 선택된 질환
  const [prohibitMedi, setProhibitMedi] = useState<ProhibitMedi[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.diseases) setSelectedDiseases(user.diseases.map(d => d.id));
  }, [user]);

  const fetchProhibitMedi = async (diseaseId: number) => {
    try {
      setLoading(true);
      setSelectedDisease(diseaseId); // 선택된 질환 업데이트
      const res = await fetch(`${BASE_URL}/users/profile/diseases/${diseaseId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setProhibitMedi(data.prohibit_medi || []);
    } catch (err) {
      console.error(err);
      Alert.alert(t('User.alert.error'), t('User.alert.cation_fail'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: '#FFFCF9' }}
      contentContainerStyle={{ paddingBottom: 50 }}
      enableOnAndroid={true}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>{t('User.cautionInfo.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('User.cautionInfo.title')}</Text>
      </View>

      {/* 선택된 질환 버튼 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('User.cautionInfo.my_cation')}</Text>
        <View style={styles.grid}>
          {selectedDiseases.map(id => {
            const disease = DISEASES.find(d => d.disease_id === id);
            if (!disease) return null;
            return (
              <TouchableOpacity
                key={id}
                style={[
                  styles.card,
                  selectedDisease === id && styles.cardSelected,
                ]}
                onPress={() => fetchProhibitMedi(id)}
              >
                <Text style={[
                  styles.cardText,
                  selectedDisease === id && styles.cardTextSelected 
                ]}>
                  {disease.disease_name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
        </View>

      ) : (
        <View style={styles.Container}>
        </View>
      )}
      {/* 금기 약물 카드 리스트 */}
      <ScrollView>
        {prohibitMedi.map((m) => (
          <View key={m.dur_chronic_id} style={styles.medicineCard}>
            <View style={styles.medicineHeader}>
              <Text style={styles.medicineName}>{m.dur_prod_name}</Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <View style={styles.medicineInfo}>
                <Text style={styles.ingredientsLabel}>
                  {t('User.cautionInfo.atc_ing')}<Text style={styles.ingredientsText}>{m.atc_ing}</Text>
                </Text>
                <Text style={styles.punishmentLabel}>
                  {t('User.cautionInfo.caution')}<Text style={styles.punishmentText}>{m.caution}</Text>
                </Text>
              </View>
              <View style={styles.medicineImageContainer}>
                <Image
                  source={{ uri: m.dur_prod_img }}
                  style={styles.medicineImage}
                  resizeMode="contain"
                />
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
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
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 6 },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    margin: 10,
  },
  card: {
    width: "30%",
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginVertical: 6,
    borderRadius: 18,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    elevation: 2,
  },
  cardSelected: {
    backgroundColor: "#ff6600",
  },
  cardText: {
    fontSize: 16,
    color: "#333",
  },
  cardTextSelected: {
    color: "#fff",
    fontWeight: "bold",
  },

  Container: { 
    marginTop: 8,
    height: 50,
    width: 50,
  },
  loadingContainer: {
    marginTop: 8,
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
  },

  medicineCard: {
    marginHorizontal: 20,
    marginVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 5,
  },
  medicineHeader: { flexDirection: 'row' },
  medicineName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    marginRight: 10,
    flex: 1,
  },
  medicineInfo: { flex: 1, paddingRight: 12, gap: 6 },
  ingredientsLabel: { fontSize: 13, color: '#FF604E', fontWeight: '500' },
  ingredientsText: { fontWeight: 'normal', color: '#FF604E' },
  punishmentLabel: { fontSize: 13, color: '#333', fontWeight: '500' },
  punishmentText: { fontWeight: 'normal', color: '#666' },
  medicineImageContainer: { justifyContent: 'center', alignItems: 'center' },
  medicineImage: { width: 100, height: 80, borderRadius: 8 },
    loadingOverlay: {
  },
});

export default CautionInfoScreen;