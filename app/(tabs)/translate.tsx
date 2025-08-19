"use client"

import { Ionicons,Fontisto } from "@expo/vector-icons"
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
  { code: "ko", name: "Korean", flag: "🇰🇷" },
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "zh-cn", name: "Chinese", flag: "🇨🇳" },
  { code: "fil", name: "Filipino", flag: "🇵🇭" },
  { code: "vi", name: "Vietnamese", flag: "🇻🇳" },
  { code: "th", name: "Thai", flag: "🇹🇭" },
]

export default function TranslateScreen() {
  const [inputText, setInputText] = useState("")
  const [translatedText, setTranslatedText] = useState("")
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
      await recording.prepareToRecordAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );

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
      formData.append("inputType", "audio");
      formData.append("sourceLanguage", sourceLanguage.code);
      formData.append("targetLanguage", targetLanguage.code);

      const response = await fetch("http://192.168.45.233:3000/api/translate", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        setInputText(result.originalText || "Voice input received")
        setTranslatedText(result.translatedText || "Translation completed")
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

    const formData = new FormData();
    formData.append("inputType", "text");
    formData.append("text", inputText);
    formData.append("sourceLanguage", sourceLanguage.code); // 예: "EN"
    formData.append("targetLanguage", targetLanguage.code); // 예: "KO"

    const response = await fetch("http://192.168.45.233:3000/api/translate", {
      method: "POST",
      body: formData
    })

    // 응답이 성공적인지 확인
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()

    if (result.translatedText) {
      setTranslatedText(result.translatedText)
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
    if (!translatedText || translatedText === "") {
      Alert.alert("Error", "No translated text to play")
      return
    }

    try {
      setIsPlaying(true)

      // Stop any currently playing sound
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      // tts
      const formData = new FormData();
      formData.append("text", translatedText);
      formData.append("sourceLanguage", sourceLanguage.code);
      formData.append("targetLanguage", targetLanguage.code);
      formData.append("inputType", "text");

      const response = await fetch("http://192.168.45.233:3000/api/translate", {
        method: "POST",
        body: formData,
      })
      const result = await response.json();

      if (!result.audioContentBase64) {
      throw new Error("TTS not supported for this language.");
      }

      const base64Uri = `data:audio/mp3;base64,${result.audioContentBase64}`;
      const { sound } = await Audio.Sound.createAsync(
        { uri: base64Uri }
      );
      soundRef.current = sound;

      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) return;
        if (status.didJustFinish) {
          setIsPlaying(false);
          sound.unloadAsync(); 
          soundRef.current = null;
        }
      });
      await sound.playAsync();
    } catch (error) {
      console.error("TTS error:", error);
      Alert.alert("Error", "Failed to play translated text");
      setIsPlaying(false);
    }
  };

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
      {/* 원문 카드 */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <TouchableOpacity style={styles.languageButton} onPress={() => setShowSourceModal(true)}>
          <Text style={styles.flag}>{sourceLanguage.flag}</Text>
          <Text style={styles.languageText}>{sourceLanguage.name}</Text>
          <Ionicons name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>
        </View>
          <TouchableOpacity style={{ position: "absolute", zIndex: 1, top: 50, right: 10 }} onPress={() => setInputText("")}>
            <Ionicons name="close" size={36} color="#000" />
          </TouchableOpacity>
        <TextInput
          style={[styles.cardContent, styles.input,{paddingRight: 40}]}
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
      {/* 리버스 */}
      <View style={styles.languageRow}>
        <TouchableOpacity onPress={swapLanguages}>
          <Fontisto name="arrow-swap" size={30} color="#333" />
        </TouchableOpacity>
      </View>
      {/* 번역 결과 카드 */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <TouchableOpacity style={styles.languageButton} onPress={() => setShowTargetModal(true)}>
          <Text style={styles.flag}>{targetLanguage.flag}</Text>
          <Text style={styles.languageText}>{targetLanguage.name}</Text>
          <Ionicons name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>
        </View>
        <Text style={styles.cardContent}>{translatedText}</Text>
        <View style={styles.cardFooter}>
          <TouchableOpacity
            onPress={async () => {
              await translateText();  
              setTimeout(() => {
                playTranslatedText();
              }, 500);
            }}
            style={styles.iconButton}
          >
            <Ionicons name="volume-high" size={24} color="#0057e7" />
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
    paddingTop: 50,
    flex: 1,
    backgroundColor: "#FFFCF9",
    padding: 30,
  },
  languageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 5,
    marginBottom: 10,
  },
  languageButton: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomWidth: 1,
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
    position: "relative",
    backgroundColor: "#fff",
    borderRadius: 8,
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
    paddingHorizontal: 15,
    minHeight: 100,
    fontSize: 18,
    marginBottom: 15,
    color: "#333",
  },
  input: {
    fontSize: 18,
    backgroundColor: "#fff",
    textAlignVertical: "top",
  },
  cardFooter: {
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  translateBtn: {
    backgroundColor: "#ff6600",
    paddingHorizontal: 12,
    paddingVertical: 8,
    height: 35,
    width: 88,
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
    width: 88,
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
