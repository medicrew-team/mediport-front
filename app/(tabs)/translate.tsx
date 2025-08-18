"use client"

import { Ionicons } from "@expo/vector-icons"
import { useState, useRef } from "react"
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
} from "react-native"
import { Audio } from "expo-av"

const LANGUAGES = [
  { code: "KO", name: "Korean", flag: "🇰🇷" },
  { code: "EN", name: "English", flag: "🇺🇸" },
  { code: "ZH", name: "Chinese", flag: "🇨🇳" },
  { code: "TL", name: "Filipino", flag: "🇵🇭" },
  { code: "VI", name: "Vietnamese", flag: "🇻🇳" },
  { code: "TH", name: "Thai", flag: "🇹🇭" },
]

export default function TranslateScreen() {
  const [inputText, setInputText] = useState("Tap to enter text")
  const [translatedText, setTranslatedText] = useState("...")
  const [sourceLanguage, setSourceLanguage] = useState(LANGUAGES[0])
  const [targetLanguage, setTargetLanguage] = useState(LANGUAGES[1])
  const [isRecording, setIsRecording] = useState(false)
  const [isTranslating, setIsTranslating] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showSourceModal, setShowSourceModal] = useState(false)
  const [showTargetModal, setShowTargetModal] = useState(false)

  const recordingRef = useRef<Audio.Recording | null>(null)
  const soundRef = useRef<Audio.Sound | null>(null)

  const swapLanguages = () => {
    const temp = sourceLanguage
    setSourceLanguage(targetLanguage)
    setTargetLanguage(temp)
    // Also swap the texts
    const tempText = inputText
    setInputText(translatedText)
    setTranslatedText(tempText)
  }

  const selectSourceLanguage = (language: (typeof LANGUAGES)[0]) => {
    setSourceLanguage(language)
    setShowSourceModal(false)
  }

  const selectTargetLanguage = (language: (typeof LANGUAGES)[0]) => {
    setTargetLanguage(language)
    setShowTargetModal(false)
  }

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync()
      if (status !== "granted") {
        Alert.alert("Permission required", "Please grant microphone permission to use voice input.")
        return
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      })

      const recording = new Audio.Recording()
      await recording.prepareToRecordAsync({
        android: {
          extension: ".m4a",
          outputFormat: 2, // MPEG_4
          audioEncoder: 3, // AAC
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: ".m4a",
          outputFormat: 2, // MPEG4AAC
          audioQuality: 1, // HIGH
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
      } as any)

      await recording.startAsync()
      recordingRef.current = recording
      setIsRecording(true)
    } catch (error) {
      console.error("Failed to start recording:", error)
      Alert.alert("Error", "Failed to start recording")
    }
  }

  const stopRecording = async () => {
    try {
      if (!recordingRef.current) return

      setIsRecording(false)
      await recordingRef.current.stopAndUnloadAsync()
      const uri = recordingRef.current.getURI()
      recordingRef.current = null

      if (uri) {
        await transcribeAudio(uri)
      }
    } catch (error) {
      console.error("Failed to stop recording:", error)
      Alert.alert("Error", "Failed to stop recording")
    }
  }

  const transcribeAudio = async (audioUri: string) => {
    try {
      setIsTranslating(true)

      const formData = new FormData()
      formData.append("audio", {
        uri: audioUri,
        type: "audio/m4a",
        name: "recording.m4a",
      } as any)
      formData.append("sourcelang", sourceLanguage.code)
      formData.append("targetlang", targetLanguage.code)

      const response = await fetch("http://172.20.48.56:3000/api/translate", {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      const result = await response.json()

      if (response.ok) {
        setInputText(result.original_text || "Voice input received")
        setTranslatedText(result.translated_text || "Translation completed")
      } else {
        throw new Error(result.error || "Translation failed")
      }
    } catch (error) {
      console.error("Transcription error:", error)
      Alert.alert("Error", "Failed to transcribe audio")
    } finally {
      setIsTranslating(false)
    }
  }

  const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'An unknown error occurred'
}

const translateText = async () => {
  if (!inputText.trim() || inputText === "Tap to enter text") {
    Alert.alert("Error", "Please enter text to translate")
    return
  }

  try {
    setIsTranslating(true)

    // FormData 대신 JSON으로 전송 (더 안정적)
    const formData = new FormData();
    formData.append("text", inputText);
    formData.append("sourcelang", sourceLanguage.code); // 예: "EN"
    formData.append("targetlang", targetLanguage.code); // 예: "KO"

    const response = await fetch("http://172.20.48.56:3000/api/translate", {
      method: "POST",
      body: formData
    })

    // 응답이 성공적인지 확인
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()

    if (result.translated_text) {
      setTranslatedText(result.translated_text)
    } else {
      throw new Error(result.error || "No translation received")
    }
  } catch (error) {
    console.error("Translation error:", error)
    
    // 헬퍼 함수를 사용하여 오류 메시지 추출
    const errorMsg = getErrorMessage(error)
    let errorMessage = "Failed to translate text"
    
    if (errorMsg.includes("fetch")) {
      errorMessage = "Network connection error. Please check your internet connection."
    } else if (errorMsg.includes("404")) {
      errorMessage = "Translation service not found. Please check the API endpoint."
    } else if (errorMsg.includes("500")) {
      errorMessage = "Server error. Please try again later."
    } else {
      errorMessage = `Translation failed: ${errorMsg}`
    }
    
    Alert.alert("Translation Error", errorMessage)
  } finally {
    setIsTranslating(false)
  }
}

  const playTranslatedText = async () => {
    if (!translatedText || translatedText === "...") {
      Alert.alert("Error", "No translated text to play")
      return
    }

    try {
      setIsPlaying(true)

      // Stop any currently playing sound
      if (soundRef.current) {
        await soundRef.current.unloadAsync()
        soundRef.current = null
      }

      // Generate TTS audio using the API
      const formData = new FormData()
      formData.append("text", translatedText)
      formData.append("targetlang", targetLanguage.code)

      const response = await fetch("http://172.20.48.56:3000/api/tts", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const audioBlob = await response.blob()
        const audioUri = URL.createObjectURL(audioBlob)

        const { sound } = await Audio.Sound.createAsync({ uri: audioUri }, { shouldPlay: true })

        soundRef.current = sound

        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            setIsPlaying(false)
          }
        })
      } else {
        throw new Error("TTS failed")
      }
    } catch (error) {
      console.error("TTS error:", error)
      Alert.alert("Error", "Failed to play translated text")
      setIsPlaying(false)
    }
  }

  const renderLanguageModal = (
    visible: boolean,
    onClose: () => void,
    onSelect: (language: (typeof LANGUAGES)[0]) => void,
    title: string,
  ) => (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={LANGUAGES}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.languageOption} onPress={() => onSelect(item)}>
                <Text style={styles.flag}>{item.flag}</Text>
                <Text style={styles.languageName}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  )

  return (
    <ScrollView style={styles.container}>
      <View style={styles.languageRow}>
        <TouchableOpacity style={styles.languageButton} onPress={() => setShowSourceModal(true)}>
          <Text style={styles.flag}>{sourceLanguage.flag}</Text>
          <Text style={styles.languageText}>{sourceLanguage.name}</Text>
          <Ionicons name="chevron-down" size={16} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity onPress={swapLanguages}>
          <Ionicons name="swap-horizontal" size={24} color="#333" style={{ marginHorizontal: 10 }} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.languageButton} onPress={() => setShowTargetModal(true)}>
          <Text style={styles.flag}>{targetLanguage.flag}</Text>
          <Text style={styles.languageText}>{targetLanguage.name}</Text>
          <Ionicons name="chevron-down" size={16} color="#666" />
        </TouchableOpacity>
      </View>

      {/* 원문 카드 */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{sourceLanguage.name}</Text>
          <TouchableOpacity onPress={() => setInputText("")}>
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
          <TouchableOpacity
            onPress={isRecording ? stopRecording : startRecording}
            style={[styles.iconButton, isRecording && styles.recordingButton]}
          >
            <Ionicons name={isRecording ? "stop" : "mic"} size={24} color={isRecording ? "#ff0000" : "#0057e7"} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.translateBtn, isTranslating && styles.translatingBtn]}
            onPress={translateText}
            disabled={isTranslating}
          >
            {isTranslating ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.translateText}>Translate</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* 번역 결과 카드 */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{targetLanguage.name}</Text>
        </View>
        <Text style={styles.cardContent}>{translatedText}</Text>
        <View style={styles.cardFooter}>
          <TouchableOpacity
            onPress={playTranslatedText}
            style={[styles.iconButton, isPlaying && styles.playingButton]}
            disabled={isPlaying}
          >
            <Ionicons name={isPlaying ? "pause" : "volume-high"} size={24} color={isPlaying ? "#ff6600" : "#0057e7"} />
          </TouchableOpacity>
        </View>
      </View>

      {renderLanguageModal(
        showSourceModal,
        () => setShowSourceModal(false),
        selectSourceLanguage,
        "Select Source Language",
      )}

      {renderLanguageModal(
        showTargetModal,
        () => setShowTargetModal(false),
        selectTargetLanguage,
        "Select Target Language",
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFCF9",
    padding: 30,
  },
  languageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  languageButton: {
    width: 150,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  flag: {
    fontSize: 18,
    marginRight: 6,
  },
  languageText: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#003366",
  },
  cardContent: {
    minHeight: 100,
    fontSize: 18,
    marginBottom: 15,
    color: "#333",
  },
  input: {
    fontSize: 18,
    padding: 8,
    backgroundColor: "#fff",
    textAlignVertical: "top",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  translateBtn: {
    backgroundColor: "#ff6600",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
  },
  translateText: {
    color: "#fff",
    fontWeight: "600",
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
  },
  recordingButton: {
    backgroundColor: "#ffebee",
  },
  translatingBtn: {
    backgroundColor: "#cccccc",
  },
  playingButton: {
    backgroundColor: "#fff3e0",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "80%",
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  languageOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  languageName: {
    fontSize: 16,
    marginLeft: 10,
    color: "#333",
  },
})
