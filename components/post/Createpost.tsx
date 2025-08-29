import React, { useState } from "react";
import { 
  Modal, 
  View, 
  TextInput, 
  TouchableOpacity, 
  Text, 
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert 
} from "react-native";
import Entypo from '@expo/vector-icons/Entypo';
import AntDesign from '@expo/vector-icons/AntDesign';
import { BASE_URL } from '../../types/ip';
interface CreatePostProps {
  visible: boolean;
  onClose: () => void;
  onCreated: () => void;
  token: string;
}
  const categories = [
  { id: 2, name: "자유" },
  { id: 3, name: "질문" },
  { id: 4, name: "맛집" },
  { id: 5, name: "동네사건사고" },
  { id: 6, name: "정보 공유" },
  { id: 7, name: "기타" },
 ];

export default function CreatePost({ visible, onClose, onCreated, token }: CreatePostProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState(2);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
 
  
  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert("알림", "제목과 내용을 입력해주세요");
      return;
    }
    const categoryToSend = selectedCategoryId === 1 ? undefined : selectedCategoryId;

    try {

          const payload = { 
      title: title.trim(), 
      content: content.trim(),
      categoryId: categoryToSend 
    };

    console.log("📤 게시글 전송 데이터:", payload);
    
      const res = await fetch(`${BASE_URL}/boards`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          title: title.trim(), 
          content: content.trim(),
          categoryId: categoryToSend 
        }),
      });

      if (res.ok) {
        Alert.alert("성공", "게시글이 작성되었습니다!");
        setTitle("");
        setContent("");
        setSelectedCategoryId(2);
        onCreated();
        onClose();
      } else {
        const data = await res.json();
        Alert.alert("오류", "작성 실패: " + data.message);
      }
    } catch (err) {
      console.error(err);
      Alert.alert("오류", "네트워크 연결을 확인해주세요");
    }
  };

  const handleClose = () => {
    setTitle("");
    setContent("");
    setSelectedCategoryId(2);
    setIsDropdownOpen(false);
    onClose();
  };

  const handleCategorySelect = (categoryId: number) => {
    setSelectedCategoryId(categoryId);
    setIsDropdownOpen(false);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <View style={{ width: 30 }}></View>
          <Text style={styles.headerTitle}>새 게시글</Text>
                    <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <AntDesign name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* 카테고리 선택 */}
          <View style={styles.categorySection}>
            <Text style={styles.sectionTitle}>카테고리</Text>
            <TouchableOpacity
              style={styles.categoryDropdown}
              onPress={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <Text style={styles.categoryText}>{categories.find(c => c.id === selectedCategoryId)?.name}</Text>
              <Entypo name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>

            {isDropdownOpen && (
              <View style={styles.dropdownMenu}>
                {categories.map((category, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dropdownItem,
                      index === categories.length - 1 && styles.lastDropdownItem
                    ]}
                    onPress={() => handleCategorySelect(category.id)}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        selectedCategoryId === category.id && styles.selectedDropdownItem,
                      ]}
                    >
                      {category.name}
                    </Text>
                    {selectedCategoryId === category.id && (
                      <AntDesign name="check" size={16} color="#FF6B35" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* 제목 입력 */}
          <View style={styles.inputSection}>
            <Text style={styles.sectionTitle}>제목</Text>
            <TextInput
              style={styles.titleInput}
              placeholder="제목을 입력하세요"
              placeholderTextColor="#999"
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
            <Text style={styles.charCount}>{title.length}/100</Text>
          </View>

          {/* 내용 입력 */}
          <View style={styles.inputSection}>
            <Text style={styles.sectionTitle}>내용</Text>
            <TextInput
              style={styles.contentInput}
              placeholder="내용을 입력하세요"
              placeholderTextColor="#999"
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical="top"
              maxLength={1000}
            />
            <Text style={styles.charCount}>{content.length}/1000</Text>
          </View>
                    <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
            <Text style={styles.submitButtonText}>완료</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFCF9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    backgroundColor: '#fff',
  },
  closeButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  submitButton: {
    alignSelf: 'flex-end',
    width: 70,
    backgroundColor: '#FF6B35',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  submitButtonText: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  categorySection: {
    marginTop: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  categoryDropdown: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownMenu: {
    zIndex: 1000,
    position: 'absolute',
    width: '100%',
    top: 70,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    marginTop: 8,
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  lastDropdownItem: {
    borderBottomWidth: 0,
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  selectedDropdownItem: {
    color: '#FF6B35',
    fontWeight: '600',
  },
  inputSection: {
    marginBottom: 24,
  },
  titleInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    minHeight: 48,
  },
  contentInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    minHeight: 200,
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 8,
  },
});