import React, { useState } from "react";
import {
    View,
    Text,
    Image,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Modal,
    SafeAreaView
} from "react-native";
import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');

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
    const [selectedDrug, setSelectedDrug] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!results || results.length === 0) {
        return (
            <View style={styles.container}>
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>처방약 정보가 없습니다.</Text>
                </View>
            </View>
        );
    }

    const handleCardClick = (drug: any) => {
        setSelectedDrug(drug);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedDrug(null);
    };

    const renderInputSection = () => (
        <View style={styles.inputSection}>
            <View style={styles.inputSectionHeader}>
                <Text style={styles.inputSectionTitle}>처방약 이미지</Text>
            </View>
            {inputImage && (
                <View style={styles.inputImageContainer}>
                    <Image source={{ uri: inputImage }} style={styles.inputImage} />
                </View>
            )}
        </View>
    );

    const renderBasicCard = (drug: any, index: number) => (
        <TouchableOpacity
            key={index}
            style={styles.basicCard}
            onPress={() => handleCardClick(drug)}
            activeOpacity={0.7}
        >
            <View style={styles.cardRow}>
                {/* 약품 이미지 */}
                <View style={styles.drugImageContainer}>
                    {drug.dbInfo?.image ? (
                        <Image source={{ uri: drug.dbInfo.image }} style={styles.drugImageSmall} />
                    ) : (
                        <View style={styles.placeholderImageSmall}>
                            <Text style={styles.placeholderTextSmall}>404</Text>
                        </View>
                    )}
                </View>

                {/* 기본 정보 */}
                <View style={styles.basicInfoContainer}>
                    <Text style={styles.drugNameSmall} numberOfLines={1}>
                        {drug.name || "제품명 없음"}
                    </Text>

                    <View style={styles.infoRowSmall}>
                        <Text style={styles.labelSmall}>약효분류: </Text>
                        <Text style={styles.valueSmall}>{drug.dbInfo?.bit || "정보없음"}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', marginVertical: 4 }}>
                        <Text style={styles.labelSmall}>복약안내: </Text>
                        <Text style={styles.summaryText} numberOfLines={2}>
                            {`${drug.ocrInfo["투약량"] || "-"}정씩 `}
                            {`${drug.ocrInfo.횟수 || "-"}회 `}
                            {`${drug.ocrInfo.일수 || "-"}일분 `}
                        </Text>
                    </View>
                    <View style={styles.badgeContainer}>
                        <View style={styles.locationBadge}>
                            <Text style={styles.badgeText}>{drug.dbInfo?.location || "구분"}</Text>
                        </View>
                        <View style={styles.formBadge}>
                            <Text style={styles.badgeText}>{drug.dbInfo?.form || "제형"}</Text>
                        </View>
                    </View>
                </View>

                {/* 더보기 아이콘 */}
                <View style={styles.moreIconContainer}>
                    <Entypo name="info-with-circle" size={20} color="#FF6600" />
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderDetailModal = () => {
        if (!isModalOpen || !selectedDrug) return null;

        return (
            <Modal
                visible={isModalOpen}
                transparent={true}
                animationType="slide"
                onRequestClose={closeModal}
            >
                <View style={styles.modalOverlay}>
                    <SafeAreaView style={styles.modalContainer}>
                        {/* 모달 헤더 */}
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalDrugName}>{selectedDrug.name}</Text>
                            <View style={styles.modalBadge}>
                                <Text style={styles.modalBadgeText}>{selectedDrug.dbInfo?.bit}</Text>
                            </View>
                        </View>

                        {/* 모달 내용 */}
                        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                            <View style={styles.modalHeaderContent}>
                                <View style={styles.sectionHeader}>
                                    <Feather name="image" style={{ marginRight: 6 }} size={26} color="#8D4DE5" />
                                    <Text style={styles.sectionTitle}>제품 이미지</Text>
                                </View>
                                <View style={styles.modalImageContainer}>
                                    {selectedDrug.dbInfo?.image ? (
                                        <Image source={{ uri: selectedDrug.dbInfo.image }} style={styles.modalDrugImage} />
                                    ) : (
                                        <View style={styles.modalPlaceholderImage}>
                                            <Text style={styles.modalPlaceholderText}>404</Text>
                                        </View>
                                    )}
                                </View>
                            </View>

                            {/* 기본 정보 섹션 */}
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Entypo name="info-with-circle" style={{ marginRight: 8 }} size={24} color="#0066ff" />
                                    <Text style={styles.sectionTitle}>기본 정보</Text>
                                </View>
                                <View style={styles.infoCard}>
                                    <Text style={styles.infoCardLabel}>주요 효능</Text>
                                    <Text style={styles.modalSummary}>{selectedDrug.dbInfo?.icd_sum}</Text>
                                </View>
                                <View style={styles.infoGrid}>
                                    <View style={styles.infoCard}>
                                        <Text style={styles.infoCardLabel}>구분</Text>
                                        <Text style={styles.infoCardValue}>{selectedDrug.dbInfo?.location || "정보없음"}</Text>
                                    </View>
                                    <View style={styles.infoCard}>
                                        <Text style={styles.infoCardLabel}>제형</Text>
                                        <Text style={styles.infoCardValue}>{selectedDrug.dbInfo?.form || "정보없음"}</Text>
                                    </View>
                                </View>
                            </View>

                            {/* OCR 정보 섹션 (있는 경우) */}
                            {selectedDrug.ocrInfo && (
                                <View style={styles.section}>
                                    <View style={styles.sectionHeader}>
                                        <MaterialCommunityIcons name="text-recognition" style={{ marginRight: 6 }} size={24} color="#8B5CF6" />
                                        <Text style={styles.sectionTitle}>처방약 정보</Text>
                                    </View>
                                    <View style={[styles.detailCard, styles.ocrCard]}>
                                        <Text style={styles.detailCardLabel}>OCR 인식 결과</Text>
                                        <Text style={styles.detailCardValue}>
                                            {`${selectedDrug.ocrInfo["투약량"] || "-"}정씩 `}
                                            {`${selectedDrug.ocrInfo.횟수 || "-"}회 `}
                                            {`${selectedDrug.ocrInfo.일수 || "-"}일분 `}
                                        </Text>
                                    </View>
                                </View>
                            )}

                            {/* 복용 정보 섹션 */}
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <MaterialCommunityIcons name="hospital-box-outline" style={{ marginRight: 6 }} size={24} color="#10B981" />
                                    <Text style={styles.sectionTitle}>복용 정보</Text>
                                </View>
                                <View style={[styles.detailCard, styles.dosageCard]}>
                                    <Text style={styles.detailCardLabel}>권장 복용법</Text>
                                    <Text style={styles.detailCardValue}>{selectedDrug.dbInfo?.dosage || "정보없음"}</Text>
                                </View>
                            </View>

                            {/* 주의사항 섹션 */}
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Ionicons name="warning" style={{ marginRight: 6 }} size={24} color="#D80027" />
                                    <Text style={styles.sectionTitle}>주의사항</Text>
                                </View>

                                <View style={[styles.detailCard, styles.warningCard]}>
                                    <Text style={styles.detailCardLabel}>투여 금지 대상</Text>
                                    <Text style={styles.detailCardValue}>{selectedDrug.dbInfo?.contraindicated || "(특이 보고 없음)"}</Text>
                                </View>

                                <View style={[styles.detailCard, styles.cautionCard]}>
                                    <Text style={styles.detailCardLabel}>주의할 음식</Text>
                                    <Text style={styles.detailCardValue}>{selectedDrug.dbInfo?.daily_interaction || "(특이 보고 없음)"}</Text>
                                </View>

                                <View style={[styles.detailCard, styles.interactionCard]}>
                                    <Text style={styles.detailCardLabel}>약물 상호작용</Text>
                                    <Text style={styles.detailCardValue}>{selectedDrug.dbInfo?.drug_interaction || "(특이 보고 없음)"}</Text>
                                </View>

                                <View style={[styles.detailCard, styles.adverseCard]}>
                                    <Text style={styles.detailCardLabel}>부작용</Text>
                                    <Text style={styles.detailCardValue}>{selectedDrug.dbInfo?.adverse_reaction || "(특이 보고 없음)"}</Text>
                                </View>
                            </View>

                            {/* 보관 정보 섹션 */}
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <AntDesign name="medicinebox" size={28} style={{ marginRight: 8 }} color="black" />
                                    <Text style={styles.sectionTitle}>보관 방법</Text>
                                </View>
                                <View style={[styles.detailCard, styles.storageCard]}>
                                    <Text style={styles.detailCardValue}>{selectedDrug.dbInfo?.storage_method || "(별도 정보 없음)"}</Text>
                                </View>
                            </View>
                        </ScrollView>

                        {/* 모달 푸터 */}
                        <View style={styles.modalFooter}>
                            <TouchableOpacity onPress={closeModal} style={styles.closeModalButton}>
                                <Text style={styles.closeModalButtonText}>닫기</Text>
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </View>
            </Modal>
        );
    };

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* 입력 섹션 */}
                {renderInputSection()}

                {/* 결과 헤더 */}
                <View style={styles.resultsHeader}>
                    <Text style={styles.resultsTitle}>처방약 분석 결과</Text>
                    <Text style={styles.resultsSubtitle}>{results.length}개의 약품을 찾았습니다</Text>
                </View>

                {/* 약품 기본 카드 리스트 */}
                <View style={styles.cardsContainer}>
                    {results.map((drug, index) => renderBasicCard(drug, index))}
                </View>
            </ScrollView>

            {/* 상세 정보 모달 */}
            {renderDetailModal()}
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

    // 입력 섹션
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
    inputSectionHeader: {
        marginBottom: 15,
        borderColor: '#c8c8c8',
        borderBottomWidth: 1,
        paddingBottom: 10,
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

    // 기본 카드 스타일
    cardsContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    basicCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderColor: '#E8E8E8',
        borderWidth: 1,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 3,
    },
    cardRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    drugImageContainer: {
        marginRight: 12,
    },
    drugImageSmall: {
        width: 60,
        height: 60,
        borderRadius: 8,
        resizeMode: 'contain',
        backgroundColor: '#F8F9FA',
    },
    placeholderImageSmall: {
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: '#F8F9FA',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderTextSmall: {
        fontSize: 24,
    },
    basicInfoContainer: {
        flex: 1,
        paddingRight: 8,
    },
    drugNameSmall: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    infoRowSmall: {
        flexDirection: 'row',
        marginVertical: 4,
    },
    labelSmall: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    valueSmall: {
        fontSize: 12,
        color: '#333',
        fontWeight: '600',
    },
    summaryText: {
        fontSize: 13,
        color: '#333',
        lineHeight: 18,
        marginBottom: 8,
    },
    badgeContainer: {
        flexDirection: 'row',
        gap: 6,
        flexWrap: 'wrap',
    },
    locationBadge: {
        backgroundColor: '#F5A623',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
    },
    formBadge: {
        backgroundColor: '#D0021B',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
    },
    ocrBadge: {
        backgroundColor: '#8B5CF6',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
    },
    badgeText: {
        fontSize: 10,
        color: '#fff',
        fontWeight: '600',
    },
    moreIconContainer: {
        justifyContent: 'center',
        paddingLeft: 8,
    },

    // 모달 스타일
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: height * 0.9,
    },
    modalHeader: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E8E8E8',
    },
    modalHeaderContent: {
        marginTop: 40,
    },
    modalImageContainer: {
        alignItems: 'center',
        borderColor: '#666',
        borderWidth: 1,
        borderRadius: 12,
        marginBottom: 20,
    },
    modalDrugImage: {
        width: 240,
        height: 240,
        borderRadius: 12,
        resizeMode: 'contain',
        backgroundColor: '#F8F9FA',
    },
    modalPlaceholderImage: {
        width: 240,
        height: 240,
        borderRadius: 12,
        backgroundColor: '#F8F9FA',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalPlaceholderText: {
        fontSize: 32,
    },
    modalDrugName: {
        marginTop: 6,
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
    },
    modalBadge: {
        marginTop: 6,
        backgroundColor: '#ff6600',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-end',
    },
    modalBadgeText: {
        fontSize: 12,
        color: '#fff',
        fontWeight: '600',
    },
    modalSummary: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
    },

    // 모달 내용
    modalContent: {
        flex: 1,
        paddingHorizontal: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    infoGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    infoCard: {
        marginVertical: 6,
        flex: 1,
        backgroundColor: '#F8F9FA',
        padding: 12,
        borderRadius: 8,
        borderColor: '#E0E0E0',
        borderWidth: 1,
    },
    infoCardLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
        marginBottom: 4,
    },
    infoCardValue: {
        fontSize: 14,
        color: '#333',
    },
    detailCard: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
    },
    ocrCard: {
        backgroundColor: '#FAF5FF',
        borderColor: '#E9D5FF',
    },
    dosageCard: {
        backgroundColor: '#F0FDF4',
        borderColor: '#BBF7D0',
    },
    warningCard: {
        backgroundColor: '#FEF2F2',
        borderColor: '#FECACA',
    },
    cautionCard: {
        backgroundColor: '#FFFBEB',
        borderColor: '#FED7AA',
    },
    interactionCard: {
        backgroundColor: '#FEFCE8',
        borderColor: '#FDE68A',
    },
    adverseCard: {
        backgroundColor: '#FAF5FF',
        borderColor: '#E9D5FF',
    },
    storageCard: {
        backgroundColor: '#EFF6FF',
        borderColor: '#DBEAFE',
    },
    detailCardLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 6,
    },
    detailCardValue: {
        fontSize: 14,
        color: '#111827',
        lineHeight: 20,
    },

    // 모달 푸터
    modalFooter: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#E8E8E8',
    },
    closeModalButton: {
        backgroundColor: '#ff6600',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',

        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,

        elevation: 3,
    },
    closeModalButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});

export default Pharmacy;