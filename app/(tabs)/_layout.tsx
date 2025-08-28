// app/(tabs)/_layout.tsx
import { Ionicons } from '@expo/vector-icons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRoute } from '@react-navigation/native';
import { Tabs } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { BottomTabBar } from '@react-navigation/bottom-tabs';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { t } from 'i18next';


const CustomTabBar = (props: BottomTabBarProps) => {
  const { state } = props;
  const currentRoute = state.routes[state.index];
  const currentName = currentRoute?.name as string;

  const mappedName = groupMap[currentName] || currentName;
  const altIndex = state.routes.findIndex(r => r.name === mappedName);

  // 대체 인덱스가 있으면 그걸로 포커스 덮어쓰기
  const mappedState = altIndex >= 0 ? { ...state, index: altIndex } : state;

  return <BottomTabBar {...props} state={mappedState} />;
};

const groupMap: Record<string, string> = {
  prohibited: "alternative",
  prescription: "alternative",
  similar: "alternative",
  pharmacy: "alternative",
};

const Pagename = () => {
  const route = useRoute();
  const effectiveRoute = groupMap[route.name] || route.name;
  
  const titles: Record<string, string> = {
    chatbot: t("User.layout.chatbot"),
    translate: t("User.layout.translate"),
    alternative: t("User.layout.alternative"),
    community: t("User.layout.community"),
    index: t("User.layout.index"),
    prohibited: t("User.layout.prohibited"),
    prescription: t("User.layout.prescription"),
    similar: t("User.layout.similar"),
    pharmacy: t("User.layout.pharmacy"),
  };
  const currentTitle = titles[route.name] || 'page';

  return (
    <View style={styles.pageNameContainer}>
      <Text style={styles.pageNameTitle}>{currentTitle}</Text>
    </View>
  );
};

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
      tabBar={(props) => <CustomTabBar {...props} />}
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
          title: t("User.layout.Tabs_chatbot"),
          tabBarIcon: ({ color, focused }) => (
            <TabBarMaterialIcon color={color} focused={focused} iconName="robot-excited" />
          ),
        }}
      />
      <Tabs.Screen
        name="translate"
        options={{
          title: t("User.layout.Tabs_translate"),
          tabBarIcon: ({ color, focused }) => (
            <TabBarMaterialIcon color={color} focused={focused} iconName="translate" />
          ),
        }}
      />
      <Tabs.Screen
        name="alternative"
        options={{
          title: t("User.layout.Tabs_alternative"),
          tabBarIcon: ({ color, focused }) => (
            <TabBarMaterialIcon color={color} focused={focused} iconName="line-scan" />
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: t("User.layout.Tabs_community"),
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon color={color} focused={focused} iconName="people" />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: t("User.layout.Tabs_index"),
          tabBarIcon: ({ color, focused }) => (
            <TabBarAwesomeIcon color={color} focused={focused} iconName="user-edit" />
          ),
        }}
      />
      {/* 다른애들 탭바에서 숨기기 */}
      <Tabs.Screen
        name="prohibited"
        options={{
          title: '반입금지 약품',
          href: null,
        }}
      />
      <Tabs.Screen
        name="prescription"
        options={{
          title: '처방약 스캔',
          href: null,
        }}
      />
      <Tabs.Screen
        name="similar"
        options={{
          title: '유사약품 조회 결과',
          href: null,
        }}
      />
      <Tabs.Screen
        name="pharmacy"
        options={{
          title: '처방약 조회 결과',
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
    fontSize: 20,
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