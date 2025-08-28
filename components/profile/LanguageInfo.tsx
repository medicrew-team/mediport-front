import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Alert
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { BASE_URL } from '../../types/ip';
import { languages, InfoScreenProps } from '../../types/profile';

const LanguageInfoScreen: React.FC<InfoScreenProps> = ({ user, onBack, onUpdate }) => {
    const { token, changeLanguage } = useAuth();
    const [language, setLanguage] = useState(user?.language || '');

    const handleLanguageChange = async (langCode: string) => {
        try {
            setLanguage(langCode);
            await changeLanguage(langCode);
            await saveLanguageToServer(langCode);
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('언어 변경 오류:', error);
            Alert.alert('오류', '언어 변경에 실패했습니다.');
        }
    };

    const saveLanguageToServer = async (langCode: string) => {
        try {
            const res = await fetch(`${BASE_URL}/users/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    nickname: user?.nickname,
                    phone: user?.phone,
                    user_img: user?.user_img,
                    language: langCode,
                }),
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            console.log('언어 서버 저장 완료');
        } catch (err) {
            console.error('서버 저장 실패:', err);
        }
    };

    return (
        <KeyboardAwareScrollView style={styles.container}>
            {/* 상단 헤더 */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <Text style={styles.backButtonText}>‹ 뒤로</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>언어 설정</Text>
            </View>

            {/* 언어 목록 */}
            <View style={styles.section}>
                {languages.map(lang => {
                    const isSelected = language === lang.code;
                    return (
                        <TouchableOpacity
                            key={lang.code}
                            style={[styles.listItem, isSelected && styles.selectedItem]}
                            onPress={() => handleLanguageChange(lang.code)}
                        >
                            <Text style={[styles.listText, isSelected && styles.selectedText]}>
                                {lang.flag} {lang.name}
                            </Text>
                            {isSelected && (
                                <Feather name="check" size={24} color="#ff6600" />
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>
        </KeyboardAwareScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFCF9' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        marginTop: 20,
        marginHorizontal: 20,
    },
    backButton: { marginRight: 15 },
    backButtonText: { fontSize: 18, color: '#007AFF', fontWeight: '600' },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
    section: {
        marginTop: 20,
        marginHorizontal: 20,
        backgroundColor: '#fff',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
    },
    listItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    listText: { fontSize: 20, color: '#333' },
    selectedItem: {
  backgroundColor: '#FFF5F0',   // 연한 오렌지 배경
  borderLeftWidth: 4,
  borderLeftColor: '#ff6600',   // 강조 라인
},

selectedText: {
  color: '#ff6600',
  fontWeight: '600',
},
});

export default LanguageInfoScreen;
