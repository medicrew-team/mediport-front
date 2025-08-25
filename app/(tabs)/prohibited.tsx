import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { BASE_URL } from '../../types/ip';

export interface ProhibitedMedicine {
  restricted_medi_id: number;
  division: string;
  ing_name: string;
  prod_name: string;
  medi_img: string;
  punish: string;
  substitute: string;
  substitute_img: string;
}

interface ApiResponse {
  list: ProhibitedMedicine[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function ProhibitedScreen() {
  const navigateToAlternative = () => {
    router.push('/alternative');
  };

  const navigateToPrescription = () => {
    router.push('/prescription');
  };

  const navigateToProhibited = () => {
    router.push('/prohibited');
  };

  const { token } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('통합검색');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const categories = ['통합검색', '약품명', '성분명'];
  
  // 페이지네이션 상태 추가
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const limit = 10;

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setIsDropdownOpen(false);
  };

  const [prohibitedMedicines, setProhibitedMedicines] = useState<ProhibitedMedicine[]>([]);

  const fetchProhibitedMedicines = async (page: number = 1) => {
    try {
      setIsLoading(true);
      const res = await fetch(`${BASE_URL}/restricts?page=${page}&limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const data: ApiResponse = await res.json();
      
      setProhibitedMedicines(data.list);
      setTotalPages(data.totalPages || Math.ceil(data.total / limit));
      setCurrentPage(page);
    } catch (err) {
      console.error(err);
      Alert.alert('오류', '제한 약물 정보를 불러오는 데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProhibitedMedicines(1);
  }, []);

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && !isLoading) {
      fetchProhibitedMedicines(page);
    }
  };

  // 페이지네이션 버튼 생성
  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // 시작 페이지 재조정
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // 이전 버튼
    if (currentPage > 1) {
      buttons.push(
        <TouchableOpacity
          key="prev"
          style={styles.paginationButton}
          onPress={() => handlePageChange(currentPage - 1)}
          disabled={isLoading}
        >
          <Text style={styles.paginationButtonText}>‹</Text>
        </TouchableOpacity>
      );
    }

    // 페이지 번호 버튼들
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <TouchableOpacity
          key={i}
          style={[
            styles.paginationButton,
            currentPage === i && styles.activePaginationButton
          ]}
          onPress={() => handlePageChange(i)}
          disabled={isLoading}
        >
          <Text style={[
            styles.paginationButtonText,
            currentPage === i && styles.activePaginationButtonText
          ]}>
            {i}
          </Text>
        </TouchableOpacity>
      );
    }

    // 다음 버튼
    if (currentPage < totalPages) {
      buttons.push(
        <TouchableOpacity
          key="next"
          style={styles.paginationButton}
          onPress={() => handlePageChange(currentPage + 1)}
          disabled={isLoading}
        >
          <Text style={styles.paginationButtonText}>›</Text>
        </TouchableOpacity>
      );
    }

    return buttons;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.navButton, styles.inactiveButton]}
          onPress={navigateToAlternative}
        >
          <Text style={[styles.buttonText, styles.inactiveButtonText]}>대체약품 조회</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, styles.activeButton]}
          onPress={navigateToProhibited}
        >
          <Text style={[styles.buttonText, styles.activeButtonText]}>반입금지 약품</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, styles.inactiveButton]}
          onPress={navigateToPrescription}
        >
          <Text style={[styles.buttonText, styles.inactiveButtonText]}>처방전 스캔</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <Text style={styles.dropdownText}>{selectedCategory}</Text>
          <Entypo name="chevron-down" size={16} color="#666" />
        </TouchableOpacity>

        {isDropdownOpen && (
          <View style={styles.dropdownMenu}>
            {categories.map((category, index) => (
              <TouchableOpacity
                key={index}
                style={styles.dropdownItem}
                onPress={() => handleCategorySelect(category)}
              >
                <Text style={[
                  styles.dropdownItemText,
                  selectedCategory === category && styles.selectedDropdownItem
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.searchInputContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.searchIcon}>
            <FontAwesome name="search" size={16} color="#666" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <View style={styles.paginationContainer}>
          <View style={styles.paginationWrapper}>
            {renderPaginationButtons()}
          </View>
        </View>
      )}

      <View style={styles.warningContainer}>
        <FontAwesome name="info-circle" size={18} color="#E65100" marginLeft={8} />
        <Text style={styles.warningText}>하단의 의약품들은 대한민국에서 불법입니다.</Text>
      </View>

      {/* 로딩 상태 표시 */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>로딩 중...</Text>
        </View>
      )}

      {/* 약품 목록 */}
      {prohibitedMedicines.map((data, index) => (
        <View key={index} style={styles.medicineCard}>
          <View style={styles.medicineHeader}>
            <Text style={styles.medicineName}>{data.prod_name}</Text>
            <Text style={styles.medicineDescription}>{data.division}</Text>
          </View>
          <View style={{ flexDirection: 'row', }}>
            <View style={styles.medicineInfo}>
              <View style={styles.medicineDetails}>
                <Text style={styles.ingredientsLabel}>
                  위험성분: <Text style={styles.ingredientsText}>{data.ing_name}</Text>
                </Text>
                <Text style={styles.punishmentLabel}>
                  처벌내용: <Text style={styles.punishmentText}>{data.punish}</Text>
                </Text>
              </View>
            </View>
            <View style={styles.medicineImageContainer}>
              <Image
                source={{ uri: data.medi_img }}
                style={styles.medicineImage}
                resizeMode="contain"
              />
            </View>
          </View>

          <View style={styles.substituteContainer}>
            <View>
              <Text style={styles.substituteLabel}>대체약품:</Text>
              <Text style={styles.substituteText}>{data.substitute}</Text>
            </View>
            <View style={styles.substituteImageContainer}>
              <Image
                source={{ uri: data.substitute_img }}
                style={styles.substituteImage}
                resizeMode="contain"
              />
            </View>
          </View>
        </View>
      ))}

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <View style={styles.paginationContainer}>
          <View style={styles.paginationWrapper}>
            {renderPaginationButtons()}
          </View>
        </View>
      )}

      {/* 하단 여백 */}
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFCF9',
  },
  section: {
    marginTop: 20,
    marginHorizontal: 20,
    backgroundColor: '#fff',
    padding: 20,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
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
  warningContainer: {
    marginHorizontal: 20,
    marginVertical: 10,
    backgroundColor: '#FFF3E0',
    padding: 15,
    borderRadius: 8,
    borderColor: '#FAEBAF',
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  warningText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#E65100',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
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
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 5,
  },
  medicineInfo: {
    flex: 1,
    paddingRight: 12,
  },
  medicineHeader: {
    flexDirection: 'row',
  },
  medicineName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    marginRight: 10,
  },
  medicineDescription: {
    marginTop: 2,
    fontSize: 12,
    color: '#666',
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderColor: '#666',
    borderWidth: 0.5,
    alignSelf: 'flex-start',
  },
  medicineDetails: {
    gap: 6,
  },
  ingredientsLabel: {
    fontSize: 13,
    color: '#FF604E',
    fontWeight: '500',
  },
  ingredientsText: {
    fontWeight: 'normal',
    color: '#FF604E',
  },
  punishmentLabel: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  punishmentText: {
    fontWeight: 'normal',
    color: '#666',
  },
  substituteContainer: {
    flexDirection: 'row',
    marginTop: 15,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEE'
  },
  substituteLabel: {
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '500',
  },
  substituteText: {
    marginTop: 4,
    marginBottom: 10,
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  medicineImageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  medicineImage: {
    width: 100,
    height: 80,
    borderRadius: 8,
  },
  substituteImageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  substituteImage: {
    width: 80,
    height: 64,
    borderRadius: 8,
  },
  searchContainer: {
    marginHorizontal: 20,
    marginVertical: 15,
    flexDirection: 'row',
    gap: 10,
    position: 'relative',
  },
  dropdownButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 105,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dropdownText: {
    fontSize: 14,
    color: '#333',
    marginRight: 5,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 50,
    left: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    width: 100,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#333',
  },
  selectedDropdownItem: {
    color: '#FF6B35',
    fontWeight: '600',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    alignItems: 'center',
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    height: 40,
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 12,
  },
  searchIcon: {
    padding: 5,
  },
  // 페이지네이션 스타일 추가
  paginationContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  paginationWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  paginationButton: {
    minWidth: 40,
    height: 40,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activePaginationButton: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  paginationButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  activePaginationButtonText: {
    color: '#fff',
  },
});