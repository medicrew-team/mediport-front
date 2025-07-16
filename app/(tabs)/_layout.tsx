// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import HeaderMenu from '../../components/HeaderMenu';

const HeaderTitle = () => (
  <View style={styles.headerTitleContainer}>
    <Text style={styles.headerTitle}>MediPort</Text>
  </View>
);

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerTitle: '',
        headerLeft: () => <HeaderTitle />,
        headerRight: () => <HeaderMenu />,
        headerStyle: {
          backgroundColor: '#fff',
          elevation: 2,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="list"
        options={{
          title: '약물 목록',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📋</Text>,
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: '스캔',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📷</Text>,
        }}
      />
      {/* 프로필과 설정은 탭에서 제거하고 햄버거 메뉴로 이동 */}
      <Tabs.Screen
        name="profile"
        options={{
          href: null, // 탭 바에서 숨김
        }}
      />
      <Tabs.Screen
        name="setting"
        options={{
          href: null, // 탭 바에서 숨김
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerTitleContainer: {
    paddingLeft: 20,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF595C',
    letterSpacing: 0.5,
  },
});