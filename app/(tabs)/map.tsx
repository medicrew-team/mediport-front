import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Image, ActivityIndicator, Alert, Dimensions, ScrollView } from "react-native";
import * as Location from "expo-location";
import axios from "axios";
import { WebView } from 'react-native-webview'; // WebView 사용시 주석 해제
import { router } from 'expo-router';

// 공공데이터 포털 키
const API_KEY = "1387921665defec904adf7aac69e8e361fdfa00412911eaeee37754ce18e59de";
// NCP Maps REST API용 인증 정보
const NCP_CLIENT_ID = "9v436t9npz";
const NCP_CLIENT_SECRET = "KSlntqLh87A0A7LDztUgAXERzr1RSZ5bqzfEnatn"; // 실제 시크릿 키로 변경 필요

export default function MapScreen() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [keyword, setKeyword] = useState("");
  const [pharmacies, setPharmacies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [mapUrl, setMapUrl] = useState("");
  const [searchLocation, setSearchLocation] = useState<{ lat: number; lng: number } | null>(null);


  const navigateToTranslate = () => {
    router.push('/translate');
  };

  const navigateToMap = () => {
    router.push('/map');
  };

  // 위치 가져오기
  const getCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("위치 권한이 필요합니다.");
      return;
    }
    const loc = await Location.getCurrentPositionAsync({});
    const coords = { lat: loc.coords.latitude, lng: loc.coords.longitude };
    setLocation(coords);
    setSearchLocation(coords); // 초기에는 현재 위치로 설정
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  // 주소를 좌표로 변환 (Geocoding) - 네이버 클라우드 플랫폼
  const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      // 올바른 네이버 클라우드 플랫폼 Geocoding API URL
      const response = await axios.get('https://maps.apigw.ntruss.com/map-geocode/v2/geocode', {
        params: {
          query: address
        },
        headers: {
          'x-ncp-apigw-api-key-id': NCP_CLIENT_ID,
          'x-ncp-apigw-api-key': NCP_CLIENT_SECRET // 올바른 헤더명
        }
      });

      console.log('Geocoding response:', response.data); // 디버깅용

      if (response.data.addresses && response.data.addresses.length > 0) {
        const addr = response.data.addresses[0];
        return {
          lat: parseFloat(addr.y),
          lng: parseFloat(addr.x)
        };
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);

      // TypeScript 안전한 에러 처리
      if (axios.isAxiosError(error)) {
        console.error('Error response:', error.response?.data);
        console.error('Error status:', error.response?.status);
        console.error('Error message:', error.message);
      } else {
        console.error('Unknown error:', error);
      }

      // Geocoding 실패시 대체 방법 - 주요 지역 좌표 하드코딩
      const locationMap: { [key: string]: { lat: number; lng: number } } = {
        '강남역': { lat: 37.4979, lng: 127.0276 },
        '강남': { lat: 37.4979, lng: 127.0276 },
        '홍대': { lat: 37.5563, lng: 126.9234 },
        '홍대입구': { lat: 37.5563, lng: 126.9234 },
        '신촌': { lat: 37.5596, lng: 126.9423 },
        '명동': { lat: 37.5637, lng: 126.9834 },
        '이태원': { lat: 37.5349, lng: 126.9947 },
        '잠실': { lat: 37.5133, lng: 127.1000 },
        '건대': { lat: 37.5403, lng: 127.0695 },
        '건대입구': { lat: 37.5403, lng: 127.0695 },
        '서울역': { lat: 37.5547, lng: 126.9707 },
        '종로': { lat: 37.5703, lng: 126.9830 },
        '종각': { lat: 37.5703, lng: 126.9830 },
        '부산': { lat: 35.1796, lng: 129.0756 },
        '대구': { lat: 35.8714, lng: 128.6014 },
        '인천': { lat: 37.4563, lng: 126.7052 },
        '광주': { lat: 35.1595, lng: 126.8526 },
        '대전': { lat: 36.3504, lng: 127.3845 },
        '울산': { lat: 35.5384, lng: 129.3114 }
      };

      const normalizedAddress = address.replace(/역$/, '').replace(/구$/, '');
      const coords = locationMap[normalizedAddress] || locationMap[address];
      if (coords) {
        console.log(`Using predefined coordinates for ${address}:`, coords);
        return coords;
      }

      return null;
    }
  };

  // 약국 검색 (공공데이터)
  const fetchPharmacies = async (lat: number, lng: number, pharmacyName?: string) => {
    setLoading(true);
    try {
      let url = `https://apis.data.go.kr/B552657/ErmctInsttInfoInqireService/getParmacyLcinfoInqire?serviceKey=${encodeURIComponent(
        API_KEY
      )}&WGS84_LON=${lng}&WGS84_LAT=${lat}&radius=2000&pageNo=1&numOfRows=50&_type=json`;

      if (pharmacyName) {
        url += `&Q0=${encodeURIComponent(pharmacyName)}`;
      }

      const res = await axios.get(url);
      const items = res.data?.response?.body?.items?.item ?? [];
      const list = Array.isArray(items) ? items : items ? [items] : [];
      setPharmacies(list);

      // 지도 HTML 생성
      const mapHTML = generateMapHTML(lat, lng, pharmacies);
      setMapUrl(mapHTML); // HTML을 저장
    } catch (err) {
      console.error('Pharmacy fetch error:', err);

      // TypeScript 안전한 에러 처리
      if (axios.isAxiosError(err)) {
        console.error('API Error response:', err.response?.data);
        console.error('API Error status:', err.response?.status);
      }

      Alert.alert("약국 정보 불러오기 실패");
      setPharmacies([]);
    } finally {
      setLoading(false);
    }
  };

const generateMapHTML = (centerLat: number, centerLng: number, pharmacyList: any[]) => {
  const markersJS = pharmacyList.map((pharmacy, index) => {
    if (!pharmacy.wgs84Lat || !pharmacy.wgs84Lon) return '';
    const name = (pharmacy.dutyName || '약국').replace(/"/g, '\\"');
    return `
      setTimeout(function() {
        const marker${index} = new naver.maps.Marker({
          position: new naver.maps.LatLng(${pharmacy.wgs84Lat}, ${pharmacy.wgs84Lon}),
          map: map,
          title: "${name}"
        });
      }, 100 * ${index});
    `;
  }).join('');

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>테스트용 네이버 지도</title>
    <style>
      html, body { margin:0; padding:0; height:100%; }
      #map { width:100%; height:100%; }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script src="https://openapi.map.naver.com/openapi/v3/maps.js"></script>
    <script>
      document.addEventListener("DOMContentLoaded", function() {
        // 지도 생성
        const map = new naver.maps.Map('map', {
          center: new naver.maps.LatLng(${centerLat}, ${centerLng}),
          zoom: 15
        });

        // 현재 위치 마커
        new naver.maps.Marker({
          position: new naver.maps.LatLng(${centerLat}, ${centerLng}),
          map: map,
          title: '현재 위치'
        });

        // 약국 마커
        ${markersJS}
      });
    </script>
  </body>
  </html>
  `;
};

  // 검색 실행
  const handleSearch = async () => {
    if (!location) return;

    if (keyword.trim() === "") {
      // 키워드가 없으면 현재 위치 기준으로 검색
      fetchPharmacies(location.lat, location.lng);
      setSearchLocation(location);
    } else {
      // 키워드가 있으면 먼저 지역 검색 시도
      const geocodedLocation = await geocodeAddress(keyword);

      if (geocodedLocation) {
        // 지역을 찾았으면 해당 지역의 약국 검색
        fetchPharmacies(geocodedLocation.lat, geocodedLocation.lng);
        setSearchLocation(geocodedLocation);
      } else {
        // 지역을 찾지 못했으면 현재 위치에서 약국명으로 검색
        fetchPharmacies(location.lat, location.lng, keyword);
        setSearchLocation(location);
      }
    }
  };

  // 내 위치로 돌아가기
  const goToMyLocation = () => {
    if (location) {
      fetchPharmacies(location.lat, location.lng);
      setSearchLocation(location);
      setKeyword("");
    }
  };

  if (!location) return <Text style={{ padding: 20 }}>위치 불러오는 중...</Text>;

  return (
    <ScrollView style={styles.container}>
      {/* 상단 버튼 */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.navButton, styles.inactiveButton]} onPress={navigateToTranslate}>
          <Text style={[styles.buttonText, styles.inactiveButtonText]}>번역</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navButton, styles.activeButton]} onPress={navigateToMap}>
          <Text style={[styles.buttonText, styles.activeButtonText]}>주변 약국 찾기</Text>
        </TouchableOpacity>
      </View>

      {/* 검색창 */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="지역명 또는 약국명 검색 (예: 강남역, 서울약국)"
          value={keyword}
          onChangeText={setKeyword}
          onSubmitEditing={handleSearch}
          style={styles.searchInput}
        />
        <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
          <Text style={{ color: "#fff" }}>검색</Text>
        </TouchableOpacity>
      </View>

      {/* 내 위치 버튼 */}
      <TouchableOpacity onPress={goToMyLocation} style={styles.myLocationButton}>
        <Text style={styles.myLocationButtonText}>📍 내 위치</Text>
      </TouchableOpacity>

      {/* 지도 */}
      <View style={styles.mapContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
            <Text>지도 로딩 중...</Text>
          </View>
        ) : (
          <View style={styles.mapPlaceholder}>
            <Text style={styles.mapTitleText}>📍 검색 결과</Text>
            <Text style={styles.mapPlaceholderText}>
              {searchLocation ?
                `위치: ${searchLocation.lat.toFixed(4)}, ${searchLocation.lng.toFixed(4)}` :
                "위치 정보 없음"
              }
            </Text>
            <Text style={styles.mapInfoText}>
              {pharmacies.length > 0 ?
                `총 ${pharmacies.length}개의 약국을 찾았습니다` :
                "검색 결과가 없습니다"
              }
            </Text>
            {/*
            {mapUrl && (
              <WebView
                source={{ html: mapUrl }}
                style={{ flex: 1, minHeight: 200 }}
                originWhitelist={['*']}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                onError={(syntheticEvent) => {
                  const { nativeEvent } = syntheticEvent;
                  console.warn('WebView error: ', nativeEvent);
                }}
              />
            )}
            */}

            {/* 약국 위치 미리보기 */}
            {pharmacies.length > 0 && (
              <View style={styles.previewContainer}>
                <Text style={styles.previewTitle}>주변 약국 위치:</Text>
                {pharmacies.slice(0, 3).map((pharmacy, index) => (
                  <Text key={index} style={styles.previewItem}>
                    📍 {pharmacy.dutyName} ({pharmacy.wgs84Lat?.substring(0, 7)}, {pharmacy.wgs84Lon?.substring(0, 8)})
                  </Text>
                ))}
                {pharmacies.length > 3 && (
                  <Text style={styles.moreText}>그 외 {pharmacies.length - 3}개 약국...</Text>
                )}
              </View>
            )}
          </View>
        )}
      </View>

      {/* 약국 리스트 */}
      {pharmacies.length === 0 ? (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {loading ? "검색 중..." : "검색 결과가 없습니다."}
      </Text>
    </View>
  ) : (
    pharmacies.map((item, index) => (
      <View key={item.hpid || index} style={styles.listItem}>
        <Text style={styles.pharmacyName}>{item.dutyName || "약국명 없음"}</Text>
        <Text style={styles.pharmacyAddress}>{item.dutyAddr || "주소 없음"}</Text>
        <Text style={styles.pharmacyPhone}>{item.dutyTel1 || "전화번호 없음"}</Text>
        {item.wgs84Lat && item.wgs84Lon && (
          <Text style={styles.distanceText}>
            좌표: {parseFloat(item.wgs84Lat).toFixed(4)}, {parseFloat(item.wgs84Lon).toFixed(4)}
          </Text>
        )}
      </View>
    ))
  )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: "#FFFCF9"
  },
  buttonContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 10
  },
  navButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 20,
    alignItems: "center"
  },
  activeButton: {
    backgroundColor: "#FF6B35"
  },
  inactiveButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#FF6B35"
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600"
  },
  activeButtonText: {
    color: "#fff"
  },
  inactiveButtonText: {
    color: "#FF6B35"
  },

  searchContainer: {
    marginTop:20,
    flexDirection: "row",
    marginBottom: 10
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    fontSize: 13
  },
  searchButton: {
    backgroundColor: "#FF6B35",
    paddingHorizontal: 12,
    justifyContent: "center",
    borderRadius: 10,
    marginLeft: 8
  },

  myLocationButton: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  myLocationButtonText: {
    color: "#333",
    fontSize: 12,
    fontWeight: "500",
  },

  mapContainer: {
    height: Dimensions.get("window").height * 0.25,
    marginBottom: 10,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  pharmacyList: {
    flex: 1,
    marginTop: 5,
  },
  listItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
    marginVertical: 2,
    borderRadius: 8,
  },
  pharmacyName: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#2c3e50",
    marginBottom: 4,
  },
  pharmacyAddress: {
    fontSize: 14,
    color: "#7f8c8d",
    marginBottom: 2,
  },
  pharmacyPhone: {
    fontSize: 14,
    color: "#3498db",
    marginBottom: 2,
  },
  webviewMap: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  distanceText: {
    fontSize: 11,
    color: "#95a5a6",
    fontStyle: "italic",
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#7f8c8d",
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#e9ecef",
    borderRadius: 10,
    padding: 20,
  },
  mapTitleText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 10,
  },
  mapPlaceholderText: {
    fontSize: 14,
    color: "#495057",
    fontWeight: "500",
    marginBottom: 5,
  },
  mapInfoText: {
    fontSize: 13,
    color: "#6c757d",
    marginBottom: 10,
    textAlign: "center",
  },

  previewContainer: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#dee2e6",
    width: "100%",
  },
  previewTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#495057",
    marginBottom: 5,
  },
  previewItem: {
    fontSize: 11,
    color: "#6c757d",
    marginBottom: 2,
  },
  moreText: {
    fontSize: 10,
    color: "#adb5bd",
    fontStyle: "italic",
    marginTop: 3,
  },
});