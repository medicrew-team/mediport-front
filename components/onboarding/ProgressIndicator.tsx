import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ProgressIndicatorProps {
  currentStepIndex: number; // 0부터 시작
  totalSteps: number;
}

export default function ProgressIndicator({ currentStepIndex, totalSteps }: ProgressIndicatorProps) {
  const progressWidth = `${((currentStepIndex + 1) / totalSteps) * 100}%`;

  return (
    <View style={styles.container}>
      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: progressWidth as any }]} />
      </View>
      <Text style={styles.progressText}>
        {currentStepIndex + 1} / {totalSteps}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 24,
    marginBottom: 20,
    alignItems: 'center',
  },
  progressBarBackground: {
    width: '100%',
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  progressText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
});
