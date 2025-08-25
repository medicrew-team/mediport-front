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

interface PharmacyProps {
    results: {
        name: string;
        dbInfo: {
            adverse_reaction?: string;
            bit?: string;
            contraindicated?: string;
            daily_interaction?: string;
            dosage?: string;
            drug_interaction?: string;
            form?: string;
            icd_sum?: string;
            image?: string;
            location?: string;
            storage_method?: string;
        };
        ocrInfo?: {
            Dosage?: string;
            ["Number of days"]?: string;
            number?: string;
        };
    }[];
    inputImage?: string;
}

const Pharmacy: React.FC<PharmacyProps> = ({ results, inputImage }) => {
    if (!results || results.length === 0) {
        return (
            <View style={styles.container}>
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>처방전 약 정보가 없습니다.</Text>
                </View>
            </View>
        );
    }

    const renderInputSection = () => (
        <View style={styles.inputSection}>
            <Text style={styles.inputSectionTitle}>매핑 이미지</Text>
            {inputImage && (
                <View style={styles.inputImageContainer}>
                    <Image source={{ uri: inputImage }} style={styles.inputImage} />
                </View>
            )}
        </View>
    );

    const renderDrugCard = ({ item }: { item: any }) => (
        <TouchableOpacity style={styles.drugCard} activeOpacity={0.8}>
            <View style={styles.cardHeader}>
                <View style={styles.drugImageContainer}>
                    {item.dbInfo?.image ? (
                        <Image source={{ uri: item.dbInfo.image }} style={styles.drugImage} />
                    ) : (
                        <View style={styles.placeholderImage}>
                            <Text style={styles.placeholderText}>이미지 없음</Text>
                        </View>
                    )}
                </View>
                <View style={styles.drugBasicInfo}>
                    <Text style={styles.drugName}>{item.name}</Text>
                </View>
            </View>

            <View style={styles.cardContent}>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>약물 분류(BIT)</Text>
                    <Text style={styles.infoText}>{item.dbInfo?.bit || "정보 없음"}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>주요 효능 및 적응증 요약(ICD Sum)</Text>
                    <Text style={styles.infoText}>{item.dbInfo?.icd_sum || "정보 없음"}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>권장 복용법(dosage)</Text>
                    <Text style={styles.infoText}>{item.dbInfo?.dosage || "정보 없음"}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>투여 금지 대상 환자(contraindicated)</Text>
                    <Text style={[styles.infoText, styles.warningText]}>
                        {item.dbInfo?.contraindicated || "(특이 보고 없음)"}
                    </Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>일상생활에서 주의할 음식(daily_interaction)</Text>
                    <Text style={[styles.infoText, styles.cautionText]}>
                        {item.dbInfo?.daily_interaction || "(특이 보고 없음)"}
                    </Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>부작용(adverse_reaction)</Text>
                    <Text style={styles.infoText}>
                        {item.dbInfo?.adverse_reaction || "(특이 보고 없음)"}
                    </Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>다른 약물과의 상호작용(drug_interaction)</Text>
                    <Text style={styles.infoText}>
                        {item.dbInfo?.drug_interaction || "(특이 보고 없음)"}
                    </Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>제형(form)</Text>
                    <Text style={styles.infoText}>{item.dbInfo?.form || "정보 없음"}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>비치 구분 (예: 일반약, 전문약, 대기 등)</Text>
                    <Text style={styles.infoText}>{item.dbInfo?.location || "정보 없음"}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>보관 방법(storage_method)</Text>
                    <Text style={styles.infoText}>{item.dbInfo?.storage_method || "(별도 정보 없음)"}</Text>
                </View>

                {/* OCR 정보 */}
                {item.ocrInfo && (
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>처방전 OCR 인식 결과</Text>
                        <Text style={styles.infoText}>
                            {`1회 복용량: ${item.ocrInfo.Dosage || "-"}정, `}
                            {`복용 일수: ${item.ocrInfo["Number of days"] || "-"}일, `}
                            {`1일 복용 횟수: ${item.ocrInfo.number || "-"}회`}
                        </Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {renderInputSection()}

                <View style={styles.resultsHeader}>
                    <Text style={styles.resultsTitle}>처방전 분석 결과</Text>
                    <Text style={styles.resultsSubtitle}>{results.length}개의 약품데이터를 가져왔습니다</Text>
                </View>

                <View style={styles.drugsContainer}>
                    {results.map((item, index) => (
                        <View key={item.name || index}>
                            {renderDrugCard({ item })}
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFCF9' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    emptyText: { fontSize: 16, textAlign: "center", color: "#666" },
    inputSection: {
        marginTop: 20, marginHorizontal: 20, backgroundColor: '#fff', padding: 20, borderRadius: 12,
        borderColor: '#E8E8E8', borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 3,
    },
    inputSectionTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 15, textAlign: 'center' },
    inputImageContainer: { alignItems: 'center', marginBottom: 10 },
    inputImage: { width: width * 0.6, height: width * 0.4, borderRadius: 8, resizeMode: 'contain' },
    resultsHeader: { marginTop: 30, marginHorizontal: 20, marginBottom: 15 },
    resultsTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 5 },
    resultsSubtitle: { fontSize: 14, color: '#666' },
    drugsContainer: { paddingHorizontal: 20, paddingBottom: 20 },
    drugCard: {
        backgroundColor: '#fff', borderRadius: 12, padding: 20, marginBottom: 16,
        borderColor: '#E8E8E8', borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 3,
    },
    cardHeader: { flexDirection: 'row', marginBottom: 20 },
    drugImageContainer: { marginRight: 15 },
    drugImage: { width: 80, height: 80, borderRadius: 8, resizeMode: 'contain', backgroundColor: '#F8F9FA' },
    placeholderImage: { width: 80, height: 80, borderRadius: 8, backgroundColor: '#F8F9FA', justifyContent: 'center', alignItems: 'center' },
    placeholderText: { fontSize: 10, color: '#999', textAlign: 'center' },
    drugBasicInfo: { flex: 1, justifyContent: 'center' },
    drugName: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 5 },
    cardContent: { borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 15 },
    infoRow: { marginBottom: 15 },
    infoLabel: { fontSize: 14, fontWeight: '600', color: '#222', marginBottom: 3 },
    infoText: { fontSize: 14, color: '#555', lineHeight: 20 },
    warningText: { color: '#FF3B30' },
    cautionText: { color: '#FF9500' },
});

export default Pharmacy;
