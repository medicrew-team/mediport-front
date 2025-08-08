// app/(tabs)/_layout.tsx
import { Ionicons } from '@expo/vector-icons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Tabs } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

const Pagename = () => (
  <View style={styles.pageNameContainer}>
    <Text style={styles.pageNameTitle}>페이지</Text>
  </View>
);

const HeaderTitle = () => (
  <View style={styles.headerTitleContainer}>
    <Text style={styles.headerTitle}>MediPort</Text>
  </View>
);

// Custom Tab Bar Icon Component for Ionicons
const TabBarIcon = ({
  color,
  focused,
  iconName
}: {
  color: string;
  focused: boolean;
  iconName: keyof typeof Ionicons.glyphMap;
}) => (
  <View style={styles.tabIconContainer}>
    <View style={[
      styles.tabIconBackground, 
      focused && styles.tabIconBackgroundFocused
    ]}>
      <Ionicons 
        name={iconName}
        size={24}
        color={focused ? '#fff' : color}
      />
    </View>
  </View>
);

// Custom Tab Bar Icon Component for MaterialCommunityIcons
const TabBarMaterialIcon = ({
  color,
  focused,
  iconName
}: {
  color: string;
  focused: boolean;
  iconName: keyof typeof MaterialCommunityIcons.glyphMap;
}) => (
  <View style={styles.tabIconContainer}>
    <View style={[
      styles.tabIconBackground, 
      focused && styles.tabIconBackgroundFocused
    ]}>
      <MaterialCommunityIcons 
        name={iconName}
        size={24}
        color={focused ? '#fff' : color}
      />
    </View>
  </View>
);
const TabBarAwesomeIcon = ({
  color,
  focused,
  iconName
}: {
  color: string;
  focused: boolean;
  iconName: keyof typeof FontAwesome5.glyphMap;
}) => (
  <View style={styles.tabIconContainer}>
    <View style={[
      styles.tabIconBackground, 
      focused && styles.tabIconBackgroundFocused
    ]}>
      <FontAwesome5 
        name={iconName}
        size={20}
        color={focused ? '#fff' : color}
        style={{ transform: [{ translateX: 3 }] }}
      />
    </View>
  </View>
);

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerTitle: '',
        headerLeft: () => <Pagename />,
        headerRight: () => <HeaderTitle />,
        headerStyle: {
          backgroundColor: '#fff',
          elevation: 2,
          shadowOffset: { width: 0, height: 1 },
          height: 100,
        },
        tabBarActiveTintColor: '#FF6B35',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0',
          height: 90,
          paddingBottom: 30,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="chatbot"
        options={{
          title: '챗봇',
          tabBarIcon: ({ color, focused }) => (
            <TabBarMaterialIcon color={color} focused={focused} iconName="robot-excited" />
          ),
        }}
      />
      <Tabs.Screen
        name="translate"
        options={{
          title: '번역',
          tabBarIcon: ({ color, focused }) => (
            <TabBarMaterialIcon color={color} focused={focused} iconName="translate" />
          ),
        }}
      />
      <Tabs.Screen
        name="alternative"
        options={{
          title: '약검색',
          tabBarIcon: ({ color, focused }) => (
            <TabBarMaterialIcon color={color} focused={focused} iconName="line-scan" />
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: '커뮤니티',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon color={color} focused={focused} iconName="people" />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: '내정보',
          tabBarIcon: ({ color, focused }) => (
            <TabBarAwesomeIcon color={color} focused={focused} iconName="user-edit" />
          ),
        }}
      />
      {/* 다른애들 탭바에서 숨기기 */}
      <Tabs.Screen
        name="prohibited"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="alternative"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerTitleContainer: {
    paddingRight: 20,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF595C',
    letterSpacing: 0.5,
  },
  pageNameContainer: {
    paddingLeft: 20,
    justifyContent: 'center',
  },
  pageNameTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1C1E',
    letterSpacing: 0.5,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconBackground: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  tabIconBackgroundFocused: {
    backgroundColor: '#FF6B35',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  tabIcon: {
    fontSize: 20,
  },
});