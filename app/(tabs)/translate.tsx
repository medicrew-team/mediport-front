import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function TranslateScreen() {

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>번역페이지</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFCF9',
  },
  section: {
    marginTop: 20,
    marginHorizontal: 20,
    backgroundColor: '#fff',
    padding: 20,
    borderColor: '#ccc',
    borderWidth: 1,

  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  }
});