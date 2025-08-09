import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function TranslateScreen() {
  const [inputText, setInputText] = useState('머리가 너무 아파요');

  return (
    <ScrollView style={styles.container}>
      {/* 언어 선택 영역 */}
      <View style={styles.languageRow}>
        <TouchableOpacity style={styles.languageButton}>
          <Text style={styles.flag}>🇰🇷</Text>
          <Text style={styles.languageText}>Korea</Text>
        </TouchableOpacity>
        <Ionicons name="swap-horizontal" size={24} color="#333" style={{ marginHorizontal: 10 }} />
        <TouchableOpacity style={styles.languageButton}>
          <Text style={styles.flag}>🇵🇭</Text>
          <Text style={styles.languageText}>Philippines</Text>
        </TouchableOpacity>
      </View>

      {/* 원문 카드 */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Korean</Text>
          <TouchableOpacity onPress={() => setInputText('')}>
            <Ionicons name="close" size={30} color="#555" />
          </TouchableOpacity>
        </View>
        <TextInput
          style={[styles.cardContent, styles.input]}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Enter text..."
          placeholderTextColor="#aaa"
          multiline
        />
        <View style={styles.cardFooter}>
          <TouchableOpacity>
            <Ionicons name="mic" size={24} color="#0057e7" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.translateBtn}>
            <Text style={styles.translateText}>Translate</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 번역 결과 카드 */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Philippines</Text>
        </View>
        <Text style={styles.cardContent}>Sobrang sakit ng ulo ko</Text>
        <View style={styles.cardFooter}>
          <TouchableOpacity>
            <Ionicons name="volume-high" size={24} color="#0057e7" />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFCF9',
    padding: 30,
  },
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  languageButton: {
    width: 150,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  flag: {
    fontSize: 18,
    marginRight: 6,
  },
  languageText: {
    fontSize: 16,
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#003366',
  },
  cardContent: {
    minHeight: 100,
    fontSize: 18,
    marginBottom: 15,
    color: '#333',
  },
  input: {
    fontSize: 18,
    padding: 8,
    backgroundColor: '#fff',
    textAlignVertical: 'top',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  translateBtn: {
    backgroundColor: '#ff6600',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
  },
  translateText: {
    color: '#fff',
    fontWeight: '600',
  },
});
