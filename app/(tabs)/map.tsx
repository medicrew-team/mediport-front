// MapScreen.tsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Dimensions, Alert } from "react-native";
import * as Location from "expo-location";
import { WebView } from "react-native-webview";
import { router } from 'expo-router';

export default function MapScreen() {
  const [location, setLocation] = useState<{ lat:number, lng:number } | null>(null);
  const [searchAddress, setSearchAddress] = useState("");

  const navigateToTranslate = () => router.push('/translate');
  const navigateToMap = () => router.push('/map');

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("위치 권한이 필요합니다.");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
    })();
  }, []);

  if (!location) return <Text style={{ padding: 20 }}>위치 불러오는 중...</Text>;

  // 네이버 지도 URL 구성
  const naverMapUrl = searchAddress
    ? `https://map.naver.com/v5/search/${encodeURIComponent(searchAddress)}?c=${location.lng},${location.lat},15,0,0,0,dh`
    : `https://map.naver.com/v5/?c=${location.lng},${location.lat},15,0,0,0,dh`;

  const handleSearchPress = () => {
    if (!searchAddress.trim()) {
      Alert.alert("검색 오류", "검색어를 입력해주세요.");
      return;
    }
  }

  return (
    <View style={styles.container}>
      {/* 상단 버튼 */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.navButton, styles.inactiveButton]} onPress={navigateToTranslate}>
          <Text style={[styles.buttonText, styles.inactiveButtonText]}>번역</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navButton, styles.activeButton]} onPress={navigateToMap}>
          <Text style={[styles.buttonText, styles.activeButtonText]}>주변 약국 찾기</Text>
        </TouchableOpacity>
      </View>

      {/* 지도 */}
      <View style={styles.mapContainer}>
        <WebView source={{ uri: naverMapUrl }} style={{ flex: 1 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFCF9", paddingTop: 50, paddingHorizontal: 20 },
  buttonContainer: { flexDirection: 'row', marginBottom: 10 },
  navButton: { flex: 1, paddingVertical: 10, marginHorizontal: 5, borderRadius: 20, alignItems: 'center' },
  activeButton: { backgroundColor: '#FF6B35' },
  inactiveButton: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#FF6B35' },
  buttonText: { fontSize: 14, fontWeight: '600' },
  activeButtonText: { color: '#fff' },
  inactiveButtonText: { color: '#FF6B35' },
  
  mapContainer: { height: Dimensions.get("window").height * 0.6 },
});
