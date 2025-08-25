import React from "react";
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  Dimensions 
} from "react-native";

const { width } = Dimensions.get('window');

interface SimilarProps {
  results: any[];
  inputImage?: string; // 사용자가 입력한 이미지 URL
  inputText?: string;  // 사용자가 입력한 텍스트
}

const Similar: React.FC<SimilarProps> = ({ results, inputImage, inputText }) => {
  if (!results || results.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>분석된 유사 약 정보가 없습니다.</Text>
        </View>
      </View>
    );
  }

  const renderInputSection = () => (
    <View style={styles.inputSection}>
      <Text style={styles.inputSectionTitle}>매핑 이미지 or 텍스트</Text>
      {inputImage && (
        <View style={styles.inputImageContainer}>
          <Image source={{ uri: inputImage }} style={styles.inputImage} />
        </View>
      )}
      {inputText && (
        <View style={styles.inputTextContainer}>
          <Text style={styles.inputText}>{inputText}</Text>
        </View>
      )}
    </View>
  );

  const renderDrugCard = ({ item, index }: { item: any; index: number }) => (
  <TouchableOpacity style={styles.drugCard} activeOpacity={0.8}>
    <View style={styles.cardHeader}>
      <View style={styles.drugImageContainer}>
        {item.prod_img ? (
          <Image source={{ uri: item.prod_img }} style={styles.drugImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>이미지 없음</Text>
          </View>
        )}
      </View>
      <View style={styles.drugBasicInfo}>
        <Text style={styles.drugName}>{item.prod_name}</Text>
      </View>
    </View>

    <View style={styles.cardContent}>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>류 (BIT)</Text>
        <Text style={styles.infoText}>{item.bit}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>적응증 (ICD Sum)</Text>
        <Text style={styles.infoText}>{item.icd_sum || "정보 없음"}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>용법/용량</Text>
        <Text style={styles.infoText}>{item.dosage || "정보 없음"}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>금기 대상</Text>
        <Text style={[styles.infoText, styles.warningText]}>
          {item.contraindicated || "(특이 보고 없음)"}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>복용 시 유의사항</Text>
        <Text style={[styles.infoText, styles.cautionText]}>
          {item.daily_interaction || "(특이 보고 없음)"}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>부작용</Text>
        <Text style={styles.infoText}>
          {item.adverse_reaction || "(특이 보고 없음)"}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>약물 상호작용</Text>
        <Text style={styles.infoText}>
          {item.drug_interaction || "(특이 보고 없음)"}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>제형</Text>
        <Text style={styles.infoText}>{item.medi_form || "정보 없음"}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>구입 경로</Text>
        <Text style={styles.infoText}>{item.purchase_loc || "정보 없음"}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>보관 방법</Text>
        <Text style={styles.infoText}>{item.storage_method || "(별도 정보 없음)"}</Text>
      </View>
    </View>
  </TouchableOpacity>
);


  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 입력 섹션 */}
        {renderInputSection()}
        
        {/* 결과 헤더 */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsTitle}>유사 의약품 분석 결과</Text>
          <Text style={styles.resultsSubtitle}>{results.length}개의 유사 약품을 찾았습니다</Text>
        </View>

        {/* 약품 리스트 */}
        <View style={styles.drugsContainer}>
          {results.map((item, index) => (
            <View key={index}>
              {renderDrugCard({ item, index })}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFCF9',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
  },
  
  // 입력 섹션 스타일
  inputSection: {
    marginTop: 20,
    marginHorizontal: 20,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    borderColor: '#E8E8E8',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  inputSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  inputImageContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  inputImage: {
    width: width * 0.6,
    height: width * 0.4,
    borderRadius: 8,
    resizeMode: 'contain',
  },
  inputTextContainer: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  inputText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },

  // 결과 헤더
  resultsHeader: {
    marginTop: 30,
    marginHorizontal: 20,
    marginBottom: 15,
  },
  resultsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  resultsSubtitle: {
    fontSize: 14,
    color: '#666',
  },

  // 약품 컨테이너
  drugsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  // 약품 카드 스타일
  drugCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderColor: '#E8E8E8',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  drugImageContainer: {
    marginRight: 15,
  },
  drugImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    resizeMode: 'contain',
    backgroundColor: '#F8F9FA',
  },
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
  },
  drugBasicInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  drugName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  drugType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  formBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  formText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },

  // 카드 내용
  cardContent: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 15,
  },
  infoRow: {
    marginBottom: 15,
  },
  infoLabel: {
  fontSize: 14,
  fontWeight: '600',
  color: '#222',
  marginBottom: 3,
},
infoText: {
  fontSize: 14,
  color: '#555',
  lineHeight: 20,
},
warningText: {
  color: '#FF3B30',
},
cautionText: {
  color: '#FF9500',
},

});

export default Similar;