import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('통합검색');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const categories = ['통합검색', '약품명', '성분명'];
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setIsDropdownOpen(false);
  };

  const prohibitedMedicines = [
    {
      name: 'Cidetuss',
      description: '항정신성 의약품',
      ingredients: '덱스트로메토르판',
      punishment: '10년 이하의 징역이나 1억원 이하의 벌금형',
      substitute: '지르텍정',
      image:'https://www.imexpharm.com/Data/Sites/1/Product/8825/Cidetuss-hop-100v.png'
    },
    {
      name: 'Cedipect',
      description: '마약',
      ingredients: '코데인',
      punishment: '무기 또는 5년 이상의 징역형',
      substitute: '뮤코로솔정',
      image: 'https://cdnv2.tgdd.vn/mwg-static/ankhang/Products/Images/10029/209230/cedipect-hinh-1-638645837001204883.jpg'
    },
    {
      name: 'Xanax',
      description: '항정신성 의약품',
      ingredients: '알프라졸탐',
      punishment: '3년 이하의 징역이나 3천만 원 이하의 벌금',
      substitute: '자낙스',
      image: 'https://i.guim.co.uk/img/media/b016fd83aa487350cf0008913709cd38c7a0d8d2/0_73_5200_3120/master/5200.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=c84b7b70788e0c02b42f3465146b488f'
    }
  ];
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

      <View style={styles.warningContainer}>
        <FontAwesome name="info-circle" size={18} color="#E65100" marginLeft={8} />
        <Text style={styles.warningText}>하단의 의약품들은 대한민국에서 불법입니다.</Text>
      </View>
      {prohibitedMedicines.map((medicine, index) => (
        <View key={index} style={styles.medicineCard}>
          <View style={styles.medicineInfo}>
            <View style={styles.medicineHeader}>
              <Text style={styles.medicineName}>{medicine.name}</Text>
              <Text style={styles.medicineDescription}>{medicine.description}</Text>
            </View>
            
            <View style={styles.medicineDetails}>
              <Text style={styles.ingredientsLabel}>
                위험성분: <Text style={styles.ingredientsText}>{medicine.ingredients}</Text>
              </Text>
              <Text style={styles.punishmentLabel}>
                처벌내용: <Text style={styles.punishmentText}>{medicine.punishment}</Text>
              </Text>
              <Text style={styles.substituteLabel}>
                대체약품: <Text style={styles.substituteText}>{medicine.substitute}</Text>
              </Text>
            </View>
          </View>
          
          <View style={styles.medicineImageContainer}>
           <Image 
              source={{ uri: medicine.image }} 
              style={styles.medicineImage}
              resizeMode="contain"
            />
          </View>
        </View>
      ))}
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
  medicineCard: {
    marginHorizontal: 20,
    marginVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
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
    marginBottom: 12,
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
  substituteLabel: {
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '500',
  },
  substituteText: {
    fontWeight: 'normal',
    color: '#007AFF',
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
});