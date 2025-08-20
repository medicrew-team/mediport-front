import React, { useState } from 'react';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AntDesign from '@expo/vector-icons/AntDesign';
import { 
  ScrollView, 
  StyleSheet, 
  Text, 
  View, 
  TextInput,
  TouchableOpacity,
  Image
} from 'react-native';

export default function CommunityScreen() {
  const [selectedCategory, setSelectedCategory] = useState('제목');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const categories = ['제목', '내용', '작성자'];
    const handleCategorySelect = (category: string) => {
      setSelectedCategory(category);
      setIsDropdownOpen(false);
    };
  const posts = [
    {
      id: 1,
      author: '일요일은 내가 팟타이 요리사',
      country: '🇹🇭 태국',
      time: '40m',
      title: '혈압약 복용 시간 까먹음',
      content: '혈압약 복용 시간에 대해 궁금한 점이 있어서 문의드립니다. 아침에 먹는 혈압약을 깜빡하고 점심 때 생각났는데, 이런 경우 어떻게 해야 할까요?',
      likes: 12,
      comments: 8,
      views: 377,
      tag: '질문'
    },
    {
      id: 2,
      author: '박항서러버',
      country: '🇻🇳 베트남',
      time: '2h',
      title: '베트남에서 병원 이용 경험 공유',
      content: '베트남에서 병원 이용 경험 궁금드립니다. 현지 의료진과 소통할 때 유용한 베트남어 표현들을 정리해봤어요.',
      likes: 24,
      comments: 15,
      views: 747,
      tag: '정보 공유'
    },
    {
      id: 3,
      author: '닝닝',
      country: '🇨🇳 중국',
      time: '12h',
      title: '현지인이 알려주는 중국 여행 꿀팁',
      content: '중국 여행, 이제 무비자로 가능하답니다! 이번 포스팅에선 중국 여행의 기본정보부터 꿀팁까지 전부 알려드릴게요!',
      likes: 55,
      comments: 19,
      views: 761,
      tag: '기타'
    },
    {
      id: 4,
      author: '건강지킴이',
      country: '🇰🇷 한국',
      time: '1d',
      title: '당뇨약과 혈압약',
      content: '당뇨약과 혈압약을 함께 복용하시는 분들 계신가요? 복용 간격이나 주의사항에 대해 정보를 공유해주세요!',
      likes: 64,
      comments: 22,
      views: 5342,
      tag: '정보 공유'
    },
    {
      id: 5,
      author: '미녀와야수',
      country: '🇵🇭 필리핀',
      time: '1d',
      title: '필리핀→한국 오시는분들',
      content: '필리핀에서 한국 돌아오시는 분들중에 약좀 구매해주실분 계신가요~',
      likes: 4,
      comments: 2,
      views: 357,
      tag: '정보 공유'
    },
    {
      id: 6,
      author: '올리버쌤',
      country: '🇺🇸 미국',
      time: '2d',
      title: '1인 자영업자인데',
      content: '연애하고싶어도 일정이 일정하지않고 남들 다 결혼하니까 외롭고...그렇다고 일로 때돈버는것도 아니고 그럭저럭 흘러가는 인생이 맞나 싶네요...',
      likes: 28,
      comments: 14,
      views: 277,
      tag: '자유'
    }
  ];

  return (
    <View style={styles.container}>
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
      <View style={styles.categoryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.smallContainer}>
          <View style={styles.categoryTitle}>
            <Text style={styles.categoryText}>자유</Text>
          </View>
          <View style={styles.categoryTitle}>
            <Text style={styles.categoryText}>질문</Text>
          </View>
          <View style={styles.categoryTitle}>
            <Text style={styles.categoryText}>맛집</Text>
          </View>
          <View style={styles.categoryTitle}>
            <Text style={styles.categoryText}>동네사건사고</Text>
          </View>
          <View style={styles.categoryTitle}>
            <Text style={styles.categoryText}>정보 공유</Text>
          </View>
          <View style={styles.categoryTitle}>
            <Text style={styles.categoryText}>기타</Text>
          </View>
        </ScrollView>
        <TouchableOpacity style={styles.categoryButton}>
          <Entypo name="chevron-down" size={24} color="#666" />
        </TouchableOpacity>
      </View>
      {/* Posts List */}
      <ScrollView style={styles.postsContainer} showsVerticalScrollIndicator={false}>
        {posts.map((post) => (
          <View key={post.id} style={styles.postCard}>
            <View style={styles.postHeader}>
              <View style={styles.avatar} />
              <View style={styles.postInfo}>
                <Text style={styles.authorName}>{post.author}</Text>
                <View style={styles.postMeta}>
                  <Text style={styles.country}>{post.country}</Text>
                  <Text style={styles.time}>• {post.time}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.followButton}>
                <Text style={styles.followText}>{post.tag}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.postTitle}>{post.title}</Text>
            {post.content && (
              <Text style={styles.postContent}>{post.content}</Text>
            )}

            <View style={styles.postStats}>
              <View style={styles.statItem}>
                <AntDesign name="like2" size={16} style={{ marginRight: 4 }} color="#666" />
                <Text style={styles.statNumber}>{post.likes}</Text>
              </View>
              <View style={styles.statItem}>
                <AntDesign name="message1" size={16} style={{ marginRight: 4 }} color="#666" />
                <Text style={styles.statNumber}>{post.comments}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statText}>View</Text>
                <Text style={styles.statNumber}>{post.views}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
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
  searchIcon: {
    padding: 5,
  },
  searchInput: {
    height: 40,
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 12,
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
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
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
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ddd',
    marginRight: 12,
  },
  postInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  country: {
    fontSize: 12,
    color: '#666',
  },
  time: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  followButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f1f2f6',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#aaa',
  },
  followText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
    lineHeight: 22,
  },
  postContent: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 12,
  },
  postStats: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f2f6',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  statText: {
    fontSize: 12,
    color: '#666',
    marginRight: 4,
  },
  statNumber: {
    fontSize: 12,
    color: '#333',
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
    left: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    width: 100,
    zIndex: 1000,
    
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
});