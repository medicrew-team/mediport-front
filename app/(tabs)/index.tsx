import React, { useState, useEffect } from 'react';
import { 
  SafeAreaView,
  ScrollView, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View, 
  Alert, 
  Image,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import BasicInfoScreen from '../../components/profile/BasicInfo';
import HealthInfoScreen from '../../components/profile/HealthInfo';
import { User } from '../../types/profile';

export default function ProfileScreen() {
  const { token, logout } = useAuth();
  const [currentView, setCurrentView] = useState('profile'); // 'profile', 'basic', 'health'
  const [user, setUser] = useState<User | null>(null);

  const handleLogout = async () => {
    await logout();
  };

  const fetchUserProfile = async () => {
    try {
      const res = await fetch('http://192.168.45.33:3000/api/users/profile', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      setUser({
        language: data.user.language,
        user_id: data.user.user_id,
        username: data.user.username,
        nickname: data.user.nickname,
        email: data.user.email,
        gender: data.user.gender,
        user_img: data.user.user_img,
        birthday: data.user.birthday,
        phone: data.user.phone,
        country: data.user.country,
        residence: data.user.residence,
        diseases: data.user.diseases,
        history: data.user.history,
      });
    } catch (err) {
      console.error(err);
      Alert.alert('Error', '사용자 정보를 가져오는데 실패했습니다.');
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // 뒤로가기 함수
  const handleBackToProfile = () => {
    setCurrentView('profile');
  };

  // 현재 뷰에 따라 다른 화면 렌더링
  if (currentView === 'basic') {
    return (
      <BasicInfoScreen 
        user={user} 
        onBack={handleBackToProfile} 
        onUpdate={fetchUserProfile} 
      />
    );
  }

  if (currentView === 'health') {
    return (
      <HealthInfoScreen 
        user={user} 
        onBack={handleBackToProfile} 
        onUpdate={fetchUserProfile} 
      />
    );
  }

  // 메인 프로필 화면
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.profileSection}>
        <View style={styles.avatar}>
          {user?.user_img ? (
            <Image
              source={{ uri: user.user_img }}
              style={styles.avatarImage}
            />
          ) : (
            // 이미지 없을 때 fallback (배경색만 있는 원)
            <View style={styles.defaultAvatar} />
          )}
        </View>
        <Text style={styles.name}>{user?.nickname}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>로그아웃</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>내 정보</Text>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => setCurrentView('basic')}
        >
          <Text style={styles.menuText}>기본 정보</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => setCurrentView('health')}
        >
          <Text style={styles.menuText}>건강 정보</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>앱 설정</Text>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>알림 설정</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>언어 설정</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>개인정보 보호</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Firebase 보안 토큰</Text>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>UID: {user?.user_id}</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingToken}>토큰: {token}</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFCF9',
  },
  profileSection: {
    padding: 30,
    alignItems: 'center',
    marginTop: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  defaultAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    backgroundColor: '#007AFF',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginTop: 20,
    marginHorizontal: 20,
    backgroundColor: '#fff',
    padding: 20,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
  arrow: {
    fontSize: 18,
    color: '#ccc',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingText: {
    fontSize: 16,
    color: '#333',
  },
  settingToken: {
    fontSize: 16,
    color: '#333',
    flexWrap: 'wrap',
  },
});