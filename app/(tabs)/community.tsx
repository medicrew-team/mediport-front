import React, { useState, useEffect } from "react";
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Text, 
  ScrollView,
  TextInput,
  Alert
} from "react-native";
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import ViewPost from "../../components/post/Viewpost";
import CreatePost from "../../components/post/Createpost";
import { PostType } from "../../types/post";
import { useAuth } from '../../contexts/AuthContext';

const API_BASE_URL = "http://192.168.45.33:3000/api";

export default function CommunityScreen() {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('제목');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('전체');
  const { token } = useAuth();

  const categories = ['제목', '내용', '작성자'];
  const filters = ['전체', '자유', '질문', '맛집', '동네사건사고', '정보 공유', '기타'];

  // 게시글 가져오기
  const fetchBoards = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/boards?page=1&limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("게시글 불러오기 실패");
      const data = await res.json();
      setPosts(data.boards || []);
    } catch (err) {
      console.error(err);
      Alert.alert("오류", "게시글을 불러오는데 실패했습니다.");
    }
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  // 검색 처리
  const handleSearch = async () => {
    try {
      const queryParam = encodeURIComponent(searchQuery);
      const filterParam = selectedFilter === '전체' ? '' : `&category=${selectedFilter}`;
      const searchParam = selectedCategory === '제목' ? `title=${queryParam}` :
                          selectedCategory === '내용' ? `content=${queryParam}` :
                          selectedCategory === '작성자' ? `author=${queryParam}` : '';

      const res = await fetch(`${API_BASE_URL}/boards?${searchParam}${filterParam}&page=1&limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("검색 실패");
      const data = await res.json();
      setPosts(data.boards || []);
    } catch (err) {
      console.error(err);
      Alert.alert("오류", "검색 중 오류가 발생했습니다.");
    }
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setIsDropdownOpen(false);
  };

  const handleFilterSelect = (filter: string) => {
    setSelectedFilter(filter);
    // 필터 적용 후 검색 API 호출
    handleSearch();
  };

  return (
    <View style={styles.container}>
      {/* 검색 영역 */}
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
                <Text
                  style={[
                    styles.dropdownItemText,
                    selectedCategory === category && styles.selectedDropdownItem,
                  ]}
                >
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
          <TouchableOpacity style={styles.searchIcon} onPress={handleSearch}>
            <FontAwesome name="search" size={16} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 카테고리 필터 */}
      <View style={styles.categoryContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.smallContainer}
        >
          {filters.map((filter, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.categoryTitle,
                selectedFilter === filter && styles.selectedCategoryTitle,
              ]}
              onPress={() => handleFilterSelect(filter)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedFilter === filter && styles.selectedCategoryText,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity style={styles.categoryButton}>
          <Entypo name="chevron-down" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {/* 게시글 리스트 */}
      <ScrollView style={styles.postsContainer} showsVerticalScrollIndicator={false}>
        {posts.map((post) => (
          <ViewPost key={post.board_id} post={post} token={token ?? ''} />
        ))}
      </ScrollView>

      {/* 글쓰기 버튼 */}
      <TouchableOpacity
        style={styles.createBtn}
        onPress={() => setShowCreate(true)}
      >
        <Text style={styles.createBtnText}>+</Text>
      </TouchableOpacity>

      {/* 글쓰기 모달 */}
      <CreatePost
        visible={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={fetchBoards}
        token={token ?? ''}
      />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFCF9',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    gap: 10,
    position: 'relative',
    borderBottomWidth: 0.5,
    borderBottomColor: '#666',
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
  },
  dropdownText: {
    fontSize: 14,
    color: '#333',
    marginRight: 5,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 50,
    left: 20,
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
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
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
  categoryContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
  },
  smallContainer: {
    width: '86%',
    flexDirection: 'row',
  },
  categoryTitle: {
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e1e8ed',
    borderRadius: 10,
    height: 40,
    justifyContent: 'center',
    marginRight: 8,
  },
  selectedCategoryTitle: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  selectedCategoryText: {
    color: '#fff',
  },
  categoryButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e1e8ed',
    marginLeft: 10,
  },
  postsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  createBtn: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#FF6B35',
    borderRadius: 30,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  createBtnText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
});