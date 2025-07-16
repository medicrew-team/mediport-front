import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// 임시 더미 데이터
const dummyMedicines = [
  { id: '1', name: '타이레놀', dosage: '500mg', frequency: '1일 3회', category: '해열진통제' },
  { id: '2', name: '아스피린', dosage: '100mg', frequency: '1일 1회', category: '심혈관약' },
  { id: '3', name: '오메프라졸', dosage: '20mg', frequency: '1일 1회', category: '소화기약' },
  { id: '4', name: '세티리진', dosage: '10mg', frequency: '1일 1회', category: '항히스타민제' },
];

export default function ListScreen() {
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');

  const categories = ['전체', '해열진통제', '심혈관약', '소화기약', '항히스타민제'];

  const filteredMedicines = dummyMedicines.filter(medicine => {
    const matchesSearch = medicine.name.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = selectedCategory === '전체' || medicine.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>약물 목록</Text>
      </View>

      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholderTextColor="#999"
          placeholder="약물 이름을 검색하세요..."
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.selectedCategoryButton
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === category && styles.selectedCategoryText
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.medicineList}>
        {filteredMedicines.map((medicine) => (
          <TouchableOpacity key={medicine.id} style={styles.medicineItem}>
            <View style={styles.medicineInfo}>
              <Text style={styles.medicineName}>{medicine.name}</Text>
              <Text style={styles.medicineDetails}>
                {medicine.dosage} | {medicine.frequency}
              </Text>
              <Text style={styles.medicineCategory}>{medicine.category}</Text>
            </View>
            <View style={styles.medicineActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>상세</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
        
        {filteredMedicines.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>검색 결과가 없습니다.</Text>
          </View>
        )}
      </ScrollView>
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
  searchSection: {
    padding: 20,
    backgroundColor: '#fff',
    
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  categoryContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    height: 35,
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
  },
  selectedCategoryButton: {
    backgroundColor: '#007AFF',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
  },
  selectedCategoryText: {
    color: '#fff',
    fontWeight: '600',
  },
  medicineList: {
    flex: 1,
    padding: 20,
  },
  medicineItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medicineInfo: {
    flex: 1,
  },
  medicineName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  medicineDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  medicineCategory: {
    fontSize: 12,
    color: '#007AFF',
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  medicineActions: {
    marginLeft: 10,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
  },
});