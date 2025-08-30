import axios from 'axios';
import * as Location from "expo-location";
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { GOOGLE_API_KEY, KAKAO_JS_KEY, KAKAO_REST_KEY } from "../../config/api";

// --- Google Translate API ---

export async function translateToEnglish(text: string): Promise<string> {
  try {
    const res = await axios.post(
      `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_API_KEY}`,
      {
        q: text,
        source: "ko",
        target: "en",
        format: "text"
      }
    );
    return res.data.data.translations[0].translatedText;
  } catch (err) {
    console.error("Translation error:", err);
    return text; // 실패하면 원문 그대로 반환
  }
}

// --- 타입 정의 (카카오 API 기준) ---
interface Pharmacy {
  id: string;
  place_name: string;
  address_name: string;
  address_name_en?: string; // 영문 주소 추가
  phone: string;
  x: string; // 경도 (longitude)
  y: string; // 위도 (latitude)
}

// --- 상수 정의 ---
const HTML_TEMPLATE = `
  <!DOCTYPE html>
  <html lang="ko">
  <head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>html, body, #map { width: 100%; height: 100%; margin: 0; padding: 0; }</style>
    <script type="text/javascript" src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_KEY}"></script>
  </head>
  <body onload="initMap()">
    <div id="map"></div>
    <script>
      let map; 
      let markers = [];
      let currentInfoWindow = null;

      function initMap() {
        const container = document.getElementById('map');
        const options = {
          center: new kakao.maps.LatLng(37.5665, 126.9780),
          level: 5
        };
        map = new kakao.maps.Map(container, options);
      }

      function clearMarkers() {
        markers.forEach(marker => marker.setMap(null));
        if (currentInfoWindow) currentInfoWindow.close();
        markers = [];
      }

      // ✅ 약국 마커
      function addPharmacies(pharmacies) {
        clearMarkers();
        const imageSrc = "http://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_number_blue.png";
        const imageSize = new kakao.maps.Size(36, 37);
        
        pharmacies.forEach((ph, i) => {
          const lat = parseFloat(ph.y);
          const lng = parseFloat(ph.x);
          if (isNaN(lat) || isNaN(lng)) return;

          const imageOption = {
            spriteSize: new kakao.maps.Size(36, 691),
            spriteOrigin: new kakao.maps.Point(0, (i * 46) + 10),
            offset: new kakao.maps.Point(13, 37)
          };
          const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);
          const position = new kakao.maps.LatLng(lat, lng);
          const marker = new kakao.maps.Marker({ position, image: markerImage });
          
          marker.setMap(map);
          markers.push(marker);

          const infowindow = new kakao.maps.InfoWindow({
            content: '<div style="padding:5px;font-size:12px;"><b>' + ph.place_name + '</b><br>' + ph.address_name + '</div>',
            removable: true
          });

          kakao.maps.event.addListener(marker, 'click', function() {
            if (currentInfoWindow) currentInfoWindow.close();
            infowindow.open(map, marker);
            currentInfoWindow = infowindow;
            
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: "MARKER_CLICKED", pharmacy: ph }));
            }
          });
        });
      }

      // ✅ 내 위치/검색 위치 마커
      function addCustomMarker(lat, lng, markerType) {
        const position = new kakao.maps.LatLng(lat, lng);
        let imageSrc = "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png"; 

        if (imageSrc) {
          const imageSize = new kakao.maps.Size(24, 35);
          const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize);
          const marker = new kakao.maps.Marker({ position, image: markerImage });
          marker.setMap(map);
        } else {
          const marker = new kakao.maps.Marker({ position });
          marker.setMap(map);
        }
      }

      // ✅ RN ↔ WebView 메시지
      function handleMessage(event) {
        try {
          const { type, payload } = JSON.parse(event.data);
          if (type === "UPDATE_PHARMACIES") {
            addPharmacies(payload.pharmacies);
          }
          if (type === "MOVE_TO_LOCATION") {
            const newPos = new kakao.maps.LatLng(payload.lat, payload.lng);
            map.panTo(newPos);
          }
          if (type === "ADD_MARKER") {
            addCustomMarker(payload.lat, payload.lng, payload.markerType);
          }
        } catch (e) {
          console.error("Message parsing error:", e);
        }
      }

      window.addEventListener("message", handleMessage);
    </script>
  </body>
  </html>
`;


// --- React 컴포넌트 ---
export default function MapViewExample() {
  // --- WebView에 삽입될 HTML 템플릿 ---
  

  const [searchQuery, setSearchQuery] = useState('');
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const webViewRef = useRef<WebView>(null);

  const postToWebView = (type: string, payload: any) => {
    webViewRef.current?.postMessage(JSON.stringify({ type, payload }));
  }

  // --- 공통 약국 검색 로직 ---
  const searchPharmaciesAt = async (lng: number, lat: number) => {
    setLoading(true);
    try {
      const url = `https://dapi.kakao.com/v2/local/search/category.json?category_group_code=PM9&x=${lng}&y=${lat}&radius=1000`;
      const res = await axios.get(url, { headers: { 'Authorization': KAKAO_REST_KEY } });
      
      // 👉 각 약국 주소를 영어로 번역
      const pharmacyList: Pharmacy[] = await Promise.all(
        (res.data.documents || []).map(async (ph: any) => {
          const englishAddr = await translateToEnglish(ph.address_name);
          return { ...ph, address_name_en: englishAddr };
        })
      );

      setPharmacies(pharmacyList);
      postToWebView('UPDATE_PHARMACIES', { pharmacies: pharmacyList });
      postToWebView('MOVE_TO_LOCATION', { lat, lng });

    } catch (err) {
      console.error(err);
      Alert.alert('오류', '주변 약국 정보를 가져오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }
  // --- 내 위치로 검색 ---
  const getMyLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        return Alert.alert("권한 필요", "위치 접근 권한을 허용해주세요.");
      }
      const loc = await Location.getCurrentPositionAsync({});
      const lat = loc.coords.latitude;
      const lng = loc.coords.longitude;
      // 내 위치 기준으로 약국 검색
      searchPharmaciesAt(loc.coords.longitude, loc.coords.latitude);
      postToWebView("ADD_MARKER", { lat, lng, title: "내 위치", markerType: "me" });
    } catch (err) {
      console.error(err);
      Alert.alert("오류", "현재 위치를 가져올 수 없습니다.");
    }
  };

  // --- 키워드로 검색 ---
  const searchByKeyword = async () => {
    if (!searchQuery.trim()) return Alert.alert('알림', '검색어를 입력해주세요.');
    setLoading(true);
    try {
      const url = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(searchQuery)}`;
      const res = await axios.get(url, { headers: { 'Authorization': KAKAO_REST_KEY } });

      if (res.data.documents.length === 0) {
        return Alert.alert('검색 결과 없음', '해당 키워드의 장소를 찾을 수 없습니다.');
      }
      const loc = res.data.documents[0];
      const lat = parseFloat(loc.y);
      const lng = parseFloat(loc.x);
      // 키워드로 찾은 장소의 좌표로 약국 재검색
      searchPharmaciesAt(parseFloat(loc.x), parseFloat(loc.y));
      postToWebView("ADD_MARKER", { lat, lng, title: searchQuery, markerType: "search" });
    } catch (err) {
      console.error(err);
      Alert.alert('오류', '키워드 검색에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const { type, pharmacy } = JSON.parse(event.nativeEvent.data);
      if (type === 'MARKER_CLICKED') setSelectedPharmacy(pharmacy);
    } catch (err) { console.error(err); }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.navButton, styles.inactiveButton]} onPress={() => router.push('/translate')}>
          <Text style={[styles.buttonText, styles.inactiveButtonText]}>번역</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navButton, styles.activeButton]} onPress={() => router.push('/map')}>
          <Text style={[styles.buttonText, styles.activeButtonText]}>주변 약국 찾기</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TouchableOpacity style={styles.locationButton} onPress={getMyLocation}>
          <Text style={{ color: '#fff', fontWeight: '600' }}>내 위치</Text>
        </TouchableOpacity>
        <View style={styles.searchWrapper}>
          <TextInput
            style={styles.searchInput}
            placeholder="장소, 주소 검색..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={searchByKeyword}
          />
          <TouchableOpacity style={styles.searchButton} onPress={searchByKeyword}>
            {loading ? <ActivityIndicator color="#fff" size={14} /> : <Text style={styles.searchButtonText}>검색</Text>}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.mapContainer}>
        <WebView
          ref={webViewRef}
          source={{ html: HTML_TEMPLATE, baseUrl: '' }}
          originWhitelist={['*']}
          mixedContentMode="always"
          javaScriptEnabled
          onMessage={handleWebViewMessage}
        />
      </View>

      {pharmacies.length > 0 && (
        <View style={styles.listContainer}>
          <ScrollView>
            {pharmacies.map((p) => (
              <TouchableOpacity 
                key={p.id}
                style={[styles.pharmacyItem, selectedPharmacy?.id === p.id && styles.selectedPharmacyItem]} 
                onPress={() => {
                  setSelectedPharmacy(p);
                  postToWebView('MOVE_TO_LOCATION', { lat: parseFloat(p.y), lng: parseFloat(p.x) });
              }}>
                <Text style={styles.pharmacyName}>{p.place_name}</Text>
                <Text style={styles.pharmacyAddress}>📍 {p.address_name}</Text>
                {p.address_name_en && (
      <Text style={styles.pharmacyAddress}>📍 {p.address_name_en}</Text>
    )}
                {p.phone && <Text style={styles.pharmacyPhone}>📞 {p.phone}</Text>}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </ScrollView>
  );
}

// --- 스타일시트 ---
const styles = StyleSheet.create({
  container: { paddingTop: 50, flex: 1, backgroundColor: "#FFFCF9", padding: 30 },
  buttonContainer: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 10 },
  navButton: { flex: 1, paddingVertical: 10, marginHorizontal: 5, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  activeButton: { backgroundColor: '#FF6B35' },
  inactiveButton: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#FF6B35' },
  buttonText: { fontSize: 14, fontWeight: '600' },
  activeButtonText: { color: '#fff' },
  inactiveButtonText: { color: '#FF6B35' },
  searchContainer: { flexDirection: 'row', marginBottom: 10 },
  locationButton: { backgroundColor: '#FFC107', borderRadius: 25, paddingHorizontal: 15, justifyContent: 'center', alignItems: 'center', marginRight: 10, marginVertical: 2 },
  searchWrapper: { flex: 1, flexDirection: 'row', justifyContent: "space-between", alignItems: 'center', borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fff', borderRadius: 25, padding: 5 },
  searchInput: { flex: 1, paddingHorizontal: 12 },
  searchButton: { paddingHorizontal: 15, paddingVertical: 10, backgroundColor: '#FF6B35', borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  searchButtonText: { color: '#fff', fontWeight: '600' },
  mapContainer: { height: 250, borderRadius: 10, overflow: 'hidden', marginBottom: 10 },
  listContainer: { height: 300, overflow: 'hidden', backgroundColor: '#fff', borderColor: '#ddd', borderWidth: 1 },
  pharmacyItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  selectedPharmacyItem: { backgroundColor: '#FFF4F0', borderLeftWidth: 4, borderLeftColor: '#FF6B35' },
  pharmacyName: { fontWeight: '600', marginBottom: 3 },
  pharmacyAddress: { color: '#666', marginBottom: 3 },
  pharmacyPhone: { color: '#FF6B35' }
});
