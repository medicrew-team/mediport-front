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
import { BASE_URL } from '../../types/ip';

export default function CommunityScreen() {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('제목');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilterId, setSelectedFilterId] = useState(1);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  const categories = ['제목', '내용', '작성자'];
  
  // 필터 배열 - 백엔드 API와 매칭되도록 설정
  const filters = [
    { id: 1, name: "전체", categoryName: null },
    { id: 2, name: "자유", categoryName: "자유" },
    { id: 3, name: "질문", categoryName: "질문" },
    { id: 4, name: "맛집", categoryName: "맛집" },
    { id: 5, name: "동네사건사고", categoryName: "동네사건사고" },
    { id: 6, name: "정보 공유", categoryName: "정보 공유" },
    { id: 7, name: "기타", categoryName: "기타" },
  ];

  // 통합된 게시글 조회 함수
  const fetchPosts = async () => {
    setLoading(true);
    try {
      // URL 생성
      let url = `${BASE_URL}/boards?page=1&limit=50`;
      
      // 카테고리 필터 추가 (전체가 아닌 경우)
      const selectedFilter = filters.find(f => f.id === selectedFilterId);
      if (selectedFilter && selectedFilter.id !== 1) {
        url += `&categoryId=${encodeURIComponent(selectedFilter.id)}`;
      }
      
      // 검색어 추가 (검색어가 있는 경우)
      if (searchQuery.trim()) {
        const queryParam = encodeURIComponent(searchQuery.trim());
        switch (selectedCategory) {
          case '제목':
            url += `&title=${queryParam}`;
            break;
          case '내용':
            url += `&content=${queryParam}`;
            break;
          case '작성자':
            url += `&author=${queryParam}`;
            break;
        }
      }

      console.log('API 호출 URL:', url); // 디버깅용
      
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      console.log('API 응답 데이터:', data); // 디버깅용
      
      setPosts(data.boards || []);
    } catch (err) {
      console.error('fetchPosts 에러:', err);
      Alert.alert("오류", "게시글을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 게시글 로드
  useEffect(() => {
    fetchPosts();
  }, []);

  // 카테고리 필터 변경 시 자동 검색
  useEffect(() => {
    fetchPosts();
  }, [selectedFilterId]);

  // 검색 실행
  const handleSearch = () => {
    fetchPosts();
  };

  // 검색 카테고리 선택
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setIsDropdownOpen(false);
    // 검색어가 있다면 새로운 카테고리로 다시 검색
    if (searchQuery.trim()) {
      // 다음 렌더링에서 fetchPosts가 호출되도록 설정
      setTimeout(() => fetchPosts(), 0);
    }
  };

  // 필터 선택
  const handleFilterSelect = (filterId: number) => {
    setSelectedFilterId(filterId);
    // useEffect에서 자동으로 fetchPosts가 호출됨
  };

  // 검색어 변경 시 실시간 검색 (옵션)
  const handleSearchInputChange = (text: string) => {
    setSearchQuery(text);
    // 검색어를 지우면 자동으로 새로고침
    if (!text.trim() && searchQuery.trim()) {
      setTimeout(() => fetchPosts(), 100);
    }
  };

  // 엔터키로 검색 (TextInput의 onSubmitEditing)
  const handleSearchSubmit = () => {
    fetchPosts();
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
            onChangeText={handleSearchInputChange}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
          />
          <TouchableOpacity 
            style={styles.searchIcon} 
            onPress={handleSearch}
            disabled={loading}
          >
            <FontAwesome name="search" size={16} color={loading ? "#ccc" : "#666"} />
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
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.categoryTitle,
                selectedFilterId === filter.id && styles.selectedCategoryTitle,
              ]}
              onPress={() => handleFilterSelect(filter.id)}
              disabled={loading}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedFilterId === filter.id && styles.selectedCategoryText,
                ]}
              >
                {filter.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity style={styles.categoryButton}>
          <Entypo name="chevron-down" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {/* 로딩 또는 게시글 리스트 */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>로딩 중...</Text>
        </View>
      ) : (
        <ScrollView style={styles.postsContainer} showsVerticalScrollIndicator={false}>
          {posts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>게시글이 없습니다.</Text>
            </View>
          ) : (
            posts.map((post) => (
              <ViewPost key={post.board_id} post={post} token={token ?? ''} />
            ))
          )}
        </ScrollView>
      )}

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
        onCreated={() => {
          setShowCreate(false);
          fetchPosts(); // 새 글 작성 후 목록 새로고침
        }}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
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