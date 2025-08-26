import React, { useState, useRef, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { BASE_URL } from '../../types/ip';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const { height: screenHeight } = Dimensions.get('window');

export default function ChatbotScreen() {
  const { token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '안녕하세요👋 메디입니다. 증상을 알려주시면 적절한 일반의약품을 추천해드릴게요. 어떤 증상이 있으신가요?',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // 로딩 애니메이션을 위한 Animated Values
  const dot1 = useRef(new Animated.Value(0.4)).current;
  const dot2 = useRef(new Animated.Value(0.4)).current;
  const dot3 = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    // 새 메시지가 추가될 때마다 스크롤을 맨 아래로
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  // 로딩 애니메이션 효과
  useEffect(() => {
    if (isLoading) {
      const animateDot = (dot: Animated.Value, delay: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.timing(dot, {
              toValue: 1,
              duration: 600,
              delay,
              useNativeDriver: false,
            }),
            Animated.timing(dot, {
              toValue: 0.4,
              duration: 600,
              useNativeDriver: false,
            }),
          ])
        );
      };

      const animation = Animated.parallel([
        animateDot(dot1, 0),
        animateDot(dot2, 200),
        animateDot(dot3, 400),
      ]);

      animation.start();

      return () => {
        animation.stop();
        dot1.setValue(0.4);
        dot2.setValue(0.4);
        dot3.setValue(0.4);
      };
    }
  }, [isLoading]);

  const sendMessage = async () => {
    if (!inputText.trim()) {
      Alert.alert('알림', '메시지를 입력해주세요.');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    // 새 메시지 추가하면서 8개 초과시 오래된 메시지 제거
    setMessages(prev => {
      const newMessages = [...prev, userMessage];
      // 8개를 초과하면 처음 메시지들을 제거 (첫 번째 환영 메시지는 항상 유지)
      if (newMessages.length > 8) {
        // 첫 번째 환영 메시지를 유지하고 나머지에서 오래된 것들 제거
        const welcomeMessage = newMessages[0];
        const recentMessages = newMessages.slice(-6); // 최근 6개 메시지
        return [welcomeMessage, ...recentMessages];
      }
      return newMessages;
    });
    
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/chatbot/recommand-medicine`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_input: userMessage.text,
        }),
      });

      const data = await response.json();
      console.log("서버 응답 데이터:", data);

      if (response.ok) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.result || '죄송합니다. 다시 시도해주세요.',
          isUser: false,
          timestamp: new Date(),
        };
        
        // 봇 메시지 추가하면서 8개 초과시 오래된 메시지 제거
        setMessages(prev => {
          const newMessages = [...prev, botMessage];
          if (newMessages.length > 8) {
            const welcomeMessage = newMessages[0];
            const recentMessages = newMessages.slice(-6);
            return [welcomeMessage, ...recentMessages];
          }
          return newMessages;
        });
      } else {
        throw new Error(data.message || '서버 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('챗봇 API 오류:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: '죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages(prev => {
        const newMessages = [...prev, errorMessage];
        if (newMessages.length > 8) {
          const welcomeMessage = newMessages[0];
          const recentMessages = newMessages.slice(-6);
          return [welcomeMessage, ...recentMessages];
        }
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderMessage = (message: Message) => (
    <View key={message.id} style={[
      styles.messageContainer,
      message.isUser ? styles.userMessageContainer : styles.botMessageContainer
    ]}>
      {!message.isUser && (
        <View style={styles.botIcon}>
              <Image
                source={require('../../assets/images/mediport.png')}
                style={{ width: "100%", height: "100%" }}
              />
        </View>
      )}
      <View style={[
        styles.messageBubble,
        message.isUser ? styles.userMessage : styles.botMessage
      ]}>
        <Text style={[
          styles.messageText,
          message.isUser ? styles.userMessageText : styles.botMessageText
        ]}>
          {message.text}
        </Text>
        <Text style={[
          styles.messageTime,
          message.isUser ? styles.userMessageTime : styles.botMessageTime
        ]}>
          {formatTime(message.timestamp)}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 25}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map(renderMessage)}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <View style={styles.botIcon}>
                <Image
                  source={require('../../assets/images/mediport.png')}
                  style={{ width: "100%", height: "100%" }}
                />
              </View>
              <View style={styles.loadingBubble}>
                <View style={styles.typingIndicator}>
                  <Animated.View style={[styles.typingDot, { opacity: dot1 }]} />
                  <Animated.View style={[styles.typingDot, { opacity: dot2 }]} />
                  <Animated.View style={[styles.typingDot, { opacity: dot3 }]} />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="증상을 입력하세요..."
              placeholderTextColor="#999"
              multiline
              maxLength={500}
              editable={!isLoading}
              returnKeyType="send"
              blurOnSubmit={false}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || isLoading) && styles.sendButtonDisabled
              ]}
              onPress={sendMessage}
              disabled={!inputText.trim() || isLoading}
            >
              <Ionicons
                name="send"
                size={20}
                color={(!inputText.trim() || isLoading) ? '#ccc' : '#fff'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFCF9',
  },
  keyboardContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  messagesContent: {
    paddingTop: 20,
    paddingBottom: 10,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  botMessageContainer: {
    justifyContent: 'flex-start',
  },
  botIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#d0d4d7',
    overflow: 'hidden'
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userMessage: {
    backgroundColor: '#FF6B35',
    borderBottomRightRadius: 4,
  },
  botMessage: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 4,
  },
  userMessageText: {
    color: '#fff',
  },
  botMessageText: {
    color: '#1A1C1E',
  },
  messageTime: {
    fontSize: 11,
    opacity: 0.7,
  },
  userMessageTime: {
    color: '#fff',
    textAlign: 'right',
  },
  botMessageTime: {
    color: '#666',
  },
  loadingContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  loadingBubble: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginLeft: 8,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6600',
    marginHorizontal: 3,
  },
  inputContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f8f8f8',
    borderRadius: 25,
    paddingHorizontal: 8,
    paddingVertical: 8,
    minHeight: 50,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1A1C1E',
    maxHeight: 100,
    paddingVertical: 8,
    textAlignVertical: 'center',
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF6600',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    shadowColor: '#FF6600',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  sendButtonDisabled: {
    backgroundColor: '#f0f0f0',
    shadowOpacity: 0,
    elevation: 0,
  },
});