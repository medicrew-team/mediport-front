import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import React, { useState } from "react";
import {
  Alert,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { BASE_URL } from '../../types/ip';
import { Comment, PostType } from "../../types/post";

interface ViewPostProps {
  post: PostType;
  token: string;
}


export default function ViewPost({ post, token }: ViewPostProps) {
  const [showDetail, setShowDetail] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState<number>(post.likeCount ?? 0);
  const [commentCount, setCommentCount] = useState<number>(post.commentCount ?? 0);
  const [viewCount, setViewCount] = useState<number>(post.view ?? 0);
  const [comment, setComment] = useState<string>("");
  const [comments, setComments] = useState<Comment[]>(post.comments ?? []);

  const formatTime = (dateString: string) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffMs = now.getTime() - postDate.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    return `${diffDays}d`;
  };

const primaryCategoryName = post.category?.name ?? '자유';

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    '자유': '#4A90E2',
    '질문': '#F5A623',
    '맛집': '#7ED321',
    '동네사건사고': '#D0021B',
    '정보 공유': '#9013FE',
    '기타': '#50E3C2'
  };
  return colors[category] ?? '#666';
};

  const handleLike = async () => {
    try {
      const res = await fetch(`${BASE_URL}/boards/${post.board_id}/likes`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("좋아요 실패");
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    } catch (err) {
      console.error(err);
      Alert.alert("오류", "좋아요 처리에 실패했습니다.");
    }
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    try {
      const res = await fetch(`${BASE_URL}/boards/${post.board_id}/comments`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ content: comment.trim() }),
      });
      if (!res.ok) throw new Error("댓글 작성 실패");
      const data = await res.json();
      setComments(prev => [...prev, data.comment]);
      setComment("");
      setCommentCount(prev => prev + 1);
    } catch (err) {
      console.error(err);
      Alert.alert("오류", "댓글 작성에 실패했습니다.");
    }
  };

  const openDetail = async () => {
    setShowDetail(true);
    try {
      const res = await fetch(`${BASE_URL}/boards/${post.board_id}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      const board =data.board;
      setLikeCount(board.likeCount ?? 0);
      setCommentCount(board.commentCount ?? 0);
      setViewCount(board.view ?? 0);
      setComments(board.comments ?? []); // 🔥 추가
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <TouchableOpacity style={styles.postCard} onPress={openDetail}>
        <View style={styles.postHeader}>
          <View style={styles.avatar}>
            {post.author?.profileImage && (
              <Image source={{ uri: post.author.profileImage }} style={styles.avatarImage} />
            )}
          </View>
          <View style={styles.postInfo}>
            <Text style={styles.authorName}>
              {post.author?.nickname || `사용자${post.board_id}`}
            </Text>
            <View style={styles.postMeta}>
              <Text style={styles.country}>
                {post.author?.country || '🇰🇷 한국'}
              </Text>
              <Text style={styles.time}>• {formatTime(post.createdAt)}</Text>
            </View>
          </View>
          <View style={[styles.categoryTag, { backgroundColor: getCategoryColor(primaryCategoryName) }]}>
            <Text style={styles.categoryText}>{primaryCategoryName}</Text>
          </View>
        </View>

        <Text style={styles.postTitle}>{post.title}</Text>
        {post.content && (
          <Text style={styles.postContent} numberOfLines={3}>{post.content}</Text>
        )}

        <View style={styles.postStats}>
          <View style={styles.statItem}>
            <AntDesign name="like2" size={16} color="#666" style={{ marginRight: 4 }} />
            <Text style={styles.statNumber}>{likeCount}</Text>
          </View>
          <View style={styles.statItem}>
            <AntDesign name="message1" size={16} color="#666" style={{ marginRight: 4 }} />
            <Text style={styles.statNumber}>{commentCount}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statText}>View</Text>
            <Text style={styles.statNumber}>{viewCount}</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* 상세 모달 */}
      <Modal visible={showDetail} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowDetail(false)} style={styles.closeButton}>
              <AntDesign name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>게시글</Text>
            <TouchableOpacity style={styles.moreButton}>
              <Entypo name="dots-three-horizontal" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.detailHeader}>
              <View style={styles.avatar}>
                {post.author?.profileImage && (
                  <Image source={{ uri: post.author.profileImage }} style={styles.avatarImage} />
                )}
              </View>
              <View style={styles.detailInfo}>
                <Text style={styles.detailAuthor}>{post.author?.nickname || `사용자${post.board_id}`}</Text>
                <View style={styles.detailMeta}>
                  <Text style={styles.detailCountry}>{post.author?.country || '🇰🇷 한국'}</Text>
                  <Text style={styles.detailTime}>• {formatTime(post.createdAt)}</Text>
                </View>
              </View>
              <View style={[styles.detailCategoryTag, { backgroundColor: getCategoryColor(primaryCategoryName) }]}>
                <Text style={styles.detailCategoryText}>{primaryCategoryName}</Text>
              </View>
            </View>

            <View style={styles.detailContent}>
              <Text style={styles.detailTitle}>{post.title}</Text>
              <Text style={styles.detailText}>{post.content}</Text>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity style={[styles.actionButton, isLiked && styles.likedButton]} onPress={handleLike}>
                <AntDesign name={isLiked ? "like1" : "like2"} size={20} color={isLiked ? "#FF6B35" : "#666"} />
                <Text style={[styles.actionText, isLiked && styles.likedText]}>좋아요 {likeCount}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <AntDesign name="message1" size={20} color="#666" />
                <Text style={styles.actionText}>댓글 {commentCount}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <AntDesign name="sharealt" size={20} color="#666" />
                <Text style={styles.actionText}>공유</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.commentSection}>
              <Text style={styles.commentTitle}>댓글 {commentCount}</Text>
              <View style={styles.commentInputContainer}>
                <TextInput
                  style={styles.commentInput}
                  placeholder="댓글을 작성해주세요"
                  placeholderTextColor="#999"
                  value={comment}
                  onChangeText={setComment}
                  multiline
                />
                <TouchableOpacity style={styles.commentSubmit} onPress={handleComment}>
                  <Text style={styles.commentSubmitText}>작성</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.commentList}>
                {comments.length === 0 ? (
                  <Text style={styles.noComments}>아직 댓글이 없습니다.</Text>
                ) : (
                  comments.map(c => (
                    <View key={c.comment_id} style={{ marginBottom: 12 }}>
                      <Text style={{ fontWeight: '600' }}>{c.author.nickname}</Text>
                      <Text>{c.content}</Text>
                    </View>
                  ))
                )}
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
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
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
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
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
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
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFCF9',
  },
  modalHeader: {
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
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  moreButton: {
    padding: 5,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
  },
  detailInfo: {
    flex: 1,
  },
  detailAuthor: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  detailMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailCountry: {
    fontSize: 14,
    color: '#666',
  },
  detailTime: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  detailCategoryTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  detailCategoryText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  detailContent: {
    paddingVertical: 20,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
    lineHeight: 28,
  },
  detailText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f1f2f6',
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    marginRight: 12,
  },
  likedButton: {
    backgroundColor: '#FFF3F0',
  },
  actionText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  likedText: {
    color: '#FF6B35',
  },
  commentSection: {
    marginBottom: 20,
  },
  commentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  commentInput: {
    flex: 1,
    maxHeight: 80,
    fontSize: 14,
    color: '#333',
  },
  commentSubmit: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  commentSubmitText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  commentList: {
    marginTop: 10,
  },
  noComments: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    paddingVertical: 40,
  },
});