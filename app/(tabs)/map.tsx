import { router } from 'expo-router';
import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Animated, ActivityIndicator, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import axios from 'axios';
import * as Location from "expo-location";


interface Pharmacy {
  dutyName: string;
  dutyAddr: string;
  dutyTel1: string;
  latitude: string;
  longitude: string;
  hpid: string;
}

const API_KEY = '1387921665defec904adf7aac69e8e361fdfa00412911eaeee37754ce18e59de'; // 공공데이터 포털 약국 API key
const BASE_URL = 'https://apis.data.go.kr/B552657/ErmctInsttInfoInqireService/getParmacyLcinfoInqire';

const HTML_TEMPLATE = (lat: number, lng: number) => `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    html, body, #map {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
    }
  </style>
  <!-- 네이버 지도 SDK -->
  <script type="text/javascript" src="https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=9v436t9npz"></script>
</head>
<body>
  <div id="map"></div>
  <script>
    let map;
    let markers = [];

    function initMap() {
      map = new naver.maps.Map("map", {
        center: new naver.maps.LatLng(37.5665, 126.9780), // 기본 서울 중심
        zoom: 15
      });
    }

    function clearMarkers() {
      markers.forEach(m => m.setMap(null));
      markers = [];
    }

function addPharmacies(pharmacies) {
  clearMarkers();
  pharmacies.forEach(ph => {
   const lat = parseFloat(ph.latitude);
   const lng = parseFloat(ph.longitude);

    if (isNaN(lat) || isNaN(lng)) return; // 좌표 없으면 skip

    const marker = new naver.maps.Marker({
      position: new naver.maps.LatLng(lat, lng),
      map: map,
      title: ph.dutyName
    });

    const info = new naver.maps.InfoWindow({
      content: \`<div style="padding:5px; font-size:12px;">
        <b>\${ph.dutyName}</b><br>\${ph.dutyAddr}
      </div>\`
    });

    naver.maps.Event.addListener(marker, "click", () => {
      if (info.getMap()) {
        info.close();
      } else {
        info.open(map, marker);

        // 클릭한 약국 정보를 RN으로 전달
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: "MARKER_CLICKED",
            pharmacy: ph
          }));
        }
      }
    });

    markers.push(marker);
  });
}

    function handleMessage(event) {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "UPDATE_PHARMACIES") {
          addPharmacies(data.pharmacies);
        }
        else if (data.type === "MOVE_TO_LOCATION") {
          const latlng = new naver.maps.LatLng(data.lat, data.lng);
          map.panTo(latlng, {duration: 500});
        }
      } catch (e) {
        console.error("메시지 파싱 오류:", e);
      }
    }
    window.ReactNativeWebView = window.ReactNativeWebView || {};
window.addEventListener("message", handleMessage);

    initMap();
  </script>
</body>
</html>
`;

export default function MapViewExample() {
  const [searchQuery, setSearchQuery] = useState('');
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const webViewRef = useRef<WebView>(null);
  const animatedHeight = useRef(new Animated.Value(0)).current;

  const navigateToTranslate = () => {
    router.push('/translate');
  };

  const navigateToMap = () => {
    router.push('/map');
  };
  const getMyLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        return Alert.alert("권한 필요", "위치 접근 권한을 허용해주세요.");
      }

      const loc = await Location.getCurrentPositionAsync({});
      const lat = loc.coords.latitude;
      const lng = loc.coords.longitude;

      console.log("내 위치:", lat, lng);

      // API 호출 (현재 좌표 기준)
      setLoading(true);
      const url = `${BASE_URL}?serviceKey=${API_KEY}&WGS84_LAT=${lat}&WGS84_LON=${lng}&radius=2000&pageNo=1&numOfRows=50&_type=json`;
      const res = await axios.get(url);
      const items = res.data?.response?.body?.items?.item ?? [];
      const list = Array.isArray(items) ? items : items ? [items] : [];

      setPharmacies(list);

      // 지도 이동 & 마커 갱신
      webViewRef.current?.postMessage(JSON.stringify({ type: "UPDATE_PHARMACIES", pharmacies: list }));
      webViewRef.current?.postMessage(JSON.stringify({ type: "MOVE_TO_LOCATION", lat, lng }));

      Animated.timing(animatedHeight, { toValue: 200, duration: 300, useNativeDriver: false }).start();
    } catch (err) {
      console.error(err);
      Alert.alert("오류", "현재 위치를 가져올 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 하드코딩된 서울 주요 역/지역 좌표
  const locationMap: { [key: string]: { lat: number; lng: number } } = {
    '강남역': { lat: 37.4979, lng: 127.0276 },
    '강남': { lat: 37.4979, lng: 127.0276 },
    '역삼역': { lat: 37.5009, lng: 127.0366 },
    '선릉역': { lat: 37.5045, lng: 127.0493 },
    '삼성역': { lat: 37.5089, lng: 127.0631 },

    '홍대': { lat: 37.5563, lng: 126.9234 },
    '홍대입구': { lat: 37.5563, lng: 126.9234 },
    '합정역': { lat: 37.5495, lng: 126.9127 },
    '상수역': { lat: 37.5475, lng: 126.9115 },

    '신촌': { lat: 37.5596, lng: 126.9423 },
    '이대역': { lat: 37.5562, lng: 126.9430 },
    '서강대역': { lat: 37.5530, lng: 126.9363 },

    '명동': { lat: 37.5637, lng: 126.9834 },
    '을지로입구': { lat: 37.5660, lng: 126.9826 },
    '충무로역': { lat: 37.5610, lng: 126.9920 },

    '이태원': { lat: 37.5349, lng: 126.9947 },
    '한남동': { lat: 37.5400, lng: 127.0021 },

    '잠실': { lat: 37.5133, lng: 127.1000 },
    '잠실역': { lat: 37.5135, lng: 127.1003 },
    '잠실새내': { lat: 37.5111, lng: 127.0958 },

    '건대': { lat: 37.5403, lng: 127.0695 },
    '건대입구': { lat: 37.5403, lng: 127.0695 },
    '어린이대공원역': { lat: 37.5407, lng: 127.0716 },

    '서울역': { lat: 37.5547, lng: 126.9707 },
    '시청역': { lat: 37.5663, lng: 126.9779 },
    '종로3가': { lat: 37.5703, lng: 126.9910 },
    '종각': { lat: 37.5703, lng: 126.9830 },
    '종로': { lat: 37.5703, lng: 126.9830 },

    '강북': { lat: 37.6324, lng: 127.0257 },
    '북촌': { lat: 37.5826, lng: 126.9836 },
    '삼청동': { lat: 37.5843, lng: 126.9818 },

    '여의도': { lat: 37.5269, lng: 126.9242 },
    '마포': { lat: 37.5665, lng: 126.9016 },
    '상암동': { lat: 37.5762, lng: 126.8851 },

    '동대문': { lat: 37.5700, lng: 127.0097 },
    '신당역': { lat: 37.5654, lng: 127.0157 },
    '왕십리': { lat: 37.5610, lng: 127.0376 },
  };

  const getCoordinates = (query: string) => locationMap[query] || { lat: 37.5665, lng: 126.9780 };

  const searchPharmacies = async () => {
    if (!searchQuery.trim()) return Alert.alert('알림', '검색할 지역을 입력해주세요.');
    setLoading(true);

    try {
      const { lat, lng } = getCoordinates(searchQuery);
      const url = `${BASE_URL}?serviceKey=${API_KEY}&WGS84_LAT=${lat}&WGS84_LON=${lng}&radius=2000&pageNo=1&numOfRows=50&_type=json`;
      const res = await axios.get(url);
      const items = res.data?.response?.body?.items?.item ?? [];
      const list = Array.isArray(items) ? items : items ? [items] : [];

      console.log("API에서 받은 약국 데이터:", list);

      setPharmacies(list);

      // 지도에 전달
      webViewRef.current?.postMessage(JSON.stringify({
        type: 'UPDATE_PHARMACIES',
        pharmacies: list
      }));
      webViewRef.current?.postMessage(JSON.stringify({ type: 'MOVE_TO_LOCATION', lat, lng }));

      Animated.timing(animatedHeight, { toValue: 200, duration: 300, useNativeDriver: false }).start();
    } catch (err) {
      console.error(err);
      Alert.alert('오류', '약국 정보를 가져오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'MARKER_CLICKED') setSelectedPharmacy(data.pharmacy);
    } catch (err) { console.error(err); }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.navButton, styles.inactiveButton]}
          onPress={navigateToTranslate}
        >
          <Text style={[styles.buttonText, styles.inactiveButtonText]}>번역</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, styles.activeButton]}
          onPress={navigateToMap}
        >
          <Text style={[styles.buttonText, styles.activeButtonText]}>주변 약국 찾기</Text>
        </TouchableOpacity>
      </View>
      {/* 검색 */}
      <View style={styles.searchContainer}>
        <TouchableOpacity style={styles.locationButton} onPress={getMyLocation}>
          <Text style={{ color: '#fff', fontWeight: '600' }}>내 위치</Text>
        </TouchableOpacity>
        <View style={styles.searchWrapper}>
          <TextInput
            style={styles.searchInput}
            placeholder="지역을 입력하세요..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={searchPharmacies}
          />
          <TouchableOpacity style={styles.searchButton} onPress={searchPharmacies}>
            {loading ? <ActivityIndicator color="#fff" size={14} /> : <Text style={styles.searchButtonText}>검색</Text>}
          </TouchableOpacity>
        </View>
      </View>

      {/* 지도 */}
      <View style={styles.mapContainer}>
        <WebView
          ref={webViewRef}
          source={{ html: HTML_TEMPLATE(37.5665, 126.9780), baseUrl: 'http://localhost:8081' }}
          javaScriptEnabled
          onMessage={handleWebViewMessage}
        />
      </View>

      {/* 약국 리스트 */}
      {pharmacies.length > 0 && (
        <Animated.View style={{ height: 300, overflow: 'hidden', backgroundColor: '#fff', borderColor: '#ddd', borderWidth: 1 }}>
          <ScrollView>
            {pharmacies.map((p, idx) => (
              <TouchableOpacity key={`${p.hpid}-${idx}`} style={[styles.pharmacyItem, selectedPharmacy?.hpid === p.hpid && styles.selectedPharmacyItem]} onPress={() => {
                setSelectedPharmacy(p);
                webViewRef.current?.postMessage(JSON.stringify({ type: 'MOVE_TO_LOCATION', lat: parseFloat(p.latitude), lng: parseFloat(p.longitude) }));
              }}>
                <Text style={styles.pharmacyName}>{p.dutyName}</Text>
                <Text style={styles.pharmacyAddress}>{p.dutyAddr}</Text>
                {p.dutyTel1 && <Text style={styles.pharmacyPhone}>📞 {p.dutyTel1}</Text>}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    flex: 1,
    backgroundColor: "#FFFCF9",
    padding: 30,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 10,
  },
  navButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginHorizontal: 5,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeButton: {
    backgroundColor: '#FF6B35',
  },
  inactiveButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  activeButtonText: {
    color: '#fff',
  },
  inactiveButtonText: {
    color: '#FF6B35',
  },
  locationButton: {
    backgroundColor: '#FFC107',
    borderRadius: 25,
    paddingHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginVertical:2
  },

  searchContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  searchWrapper: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: "space-between",
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 5
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 12
  },
  searchButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#FF6B35',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: { color: '#fff', fontWeight: '600' },
  mapContainer: { height: 250, borderRadius: 10, overflow: 'hidden', marginBottom: 10 },
  pharmacyItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  selectedPharmacyItem: { backgroundColor: '#FFF4F0', borderLeftWidth: 4, borderLeftColor: '#FF6B35' },
  pharmacyName: { fontWeight: '600', marginBottom: 3 },
  pharmacyAddress: { color: '#666', marginBottom: 3 },
  pharmacyPhone: { color: '#FF6B35' }
});
