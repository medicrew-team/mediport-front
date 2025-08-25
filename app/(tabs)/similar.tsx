// app/alternative.tsx
import React from "react";
import { useLocalSearchParams } from "expo-router";
import { View, Text } from "react-native";
import Similar from "../../components/medi/SimilarMedi";

export default function SimilarPage() {
  const { results, inputImage, inputText } = useLocalSearchParams();

  let parsedResults: any[] = [];
  try {
    parsedResults = results ? JSON.parse(results as string) : [];
  } catch (e) {
    console.warn("결과 파싱 실패:", e);
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFCF9" }}>
      {parsedResults.length > 0 ? (
        <Similar 
          results={parsedResults}
          inputImage={inputImage as string}
          inputText={inputText as string}
        />
      ) : (
        <View style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center',
          padding: 20 
        }}>
          <Text style={{ 
            fontSize: 16, 
            color: "#666",
            textAlign: 'center',
            marginBottom: 10
          }}>
            조회된 결과가 없습니다.
          </Text>
          <Text style={{ 
            fontSize: 14, 
            color: "#999",
            textAlign: 'center'
          }}>
            다시 촬영하여 시도해보세요.
          </Text>
        </View>
      )}
    </View>
  );
}