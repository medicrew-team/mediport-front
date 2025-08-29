import { router } from 'expo-router';
import { Ionicons,Fontisto } from "@expo/vector-icons"
import { useState, useRef, useMemo  } from "react"
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
import { BASE_URL } from "../../types/ip"
import { t } from 'i18next';



export default function TranslateScreen() {
  const [inputText, setInputText] = useState("")

    const navigateToTranslate = () => {
      router.push('/translate');
    };
  
    const navigateToMap = () => {
      router.push('/map');
    };

const LANGUAGES = useMemo(() => [
  { code: "ko", name: t('User.translate.language.ko'), flag: "🇰🇷" },
  { code: "en", name: t('User.translate.language.en'), flag: "🇺🇸" },
  { code: "zh-cn", name: t('User.translate.language.cn'), flag: "🇨🇳" },
  { code: "fil", name: t('User.translate.language.fil'), flag: "🇵🇭" },
  { code: "vi", name: t('User.translate.language.vi'), flag: "🇻🇳" },
  { code: "th", name: t('User.translate.language.th'), flag: "🇹🇭" },
], [t])

const PHRASES = useMemo(() => ({
  hospital: [
    t('User.translate.hospital.1'),
    t('User.translate.hospital.2'),
    t('User.translate.hospital.3'),
    t('User.translate.hospital.4'),
    t('User.translate.hospital.5'),
    t('User.translate.hospital.6'),
    t('User.translate.hospital.7'),
    t('User.translate.hospital.8'),
    t('User.translate.hospital.9'),
    t('User.translate.hospital.10'),
    t('User.translate.hospital.11'),
    t('User.translate.hospital.12'),
    t('User.translate.hospital.13'),
    t('User.translate.hospital.14'),
    t('User.translate.hospital.15'),
    t('User.translate.hospital.16'),
    t('User.translate.hospital.17'),
    t('User.translate.hospital.18'),
    t('User.translate.hospital.19'),
    t('User.translate.hospital.20'),
  ],
  pharmacy: [
    t('User.translate.pharmacy.1'),
    t('User.translate.pharmacy.2'),
    t('User.translate.pharmacy.3'),
    t('User.translate.pharmacy.4'),
    t('User.translate.pharmacy.5'),
    t('User.translate.pharmacy.6'),
    t('User.translate.pharmacy.7'),
    t('User.translate.pharmacy.8'),
    t('User.translate.pharmacy.9'),
    t('User.translate.pharmacy.10'),
    t('User.translate.pharmacy.11'),
    t('User.translate.pharmacy.12'),
    t('User.translate.pharmacy.13'),
    t('User.translate.pharmacy.14'),
    t('User.translate.pharmacy.15'),
    t('User.translate.pharmacy.16'),
    t('User.translate.pharmacy.17'),
    t('User.translate.pharmacy.18'),
    t('User.translate.pharmacy.19'),
    t('User.translate.pharmacy.20'),
  ]
}), [t])
  
  const [translatedText, setTranslatedText] = useState("")
  const [sourceLanguage, setSourceLanguage] = useState(LANGUAGES[1])
  const [targetLanguage, setTargetLanguage] = useState(LANGUAGES[0])
  const [isRecording, setIsRecording] = useState(false)
  const [isTranslating, setIsTranslating] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showSourceModal, setShowSourceModal] = useState(false)
  const [showTargetModal, setShowTargetModal] = useState(false)

  const recordingRef = useRef<Audio.Recording | null>(null)
  const soundRef = useRef<Audio.Sound | null>(null)

  const [showPhraseModal, setShowPhraseModal] = useState(false)

  

const selectPhrase = (phrase: string) => {
  setInputText(phrase)
  setShowPhraseModal(false)
}

const renderPhraseModal = () => (
  <Modal visible={showPhraseModal} transparent animationType="slide">
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{t('User.translate.modal_title')}</Text>
          <TouchableOpacity onPress={() => setShowPhraseModal(false)}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        <ScrollView>
          {Object.entries(PHRASES).map(([category, phrases]) => (
            <View key={category} style={{ marginBottom: 15 }}>
              <Text style={{ fontWeight: "700", fontSize: 16, marginBottom: 8 }}>
                {category === "hospital" ? t('User.translate.modal_hospital') :
                 category === "pharmacy" ? t('User.translate.input_pharmacy') : category}
              </Text>
              {phrases.map((p, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.phraseItem}
                  onPress={() => selectPhrase(p)}
                >
                  <Text style={styles.phraseText}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  </Modal>
)

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
        Alert.alert(t('User.alert.Permission'), t('User.alert.microphone_Permission'))
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
      Alert.alert(t('User.alert.error'), t('User.alert.start_recording_fail'))
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
      Alert.alert(t('User.alert.error'), t('User.alert.end_recording_fail'))
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

      const response = await fetch(`${BASE_URL}/translate`, {
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
      Alert.alert(t('User.alert.error'), t('User.alert.tranalate_fail'))
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
    Alert.alert(t('User.alert.error'), t('User.alert.input_please'))
    return
  }

  try {
    setIsTranslating(true)

    const formData = new FormData();
    formData.append("inputType", "text");
    formData.append("text", inputText);
    formData.append("sourceLanguage", sourceLanguage.code); // 예: "EN"
    formData.append("targetLanguage", targetLanguage.code); // 예: "KO"

    const response = await fetch(`${BASE_URL}/translate`, {
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
    
    console.error("Translation Error", errorMessage)
  } finally {
    setIsTranslating(false)
  }
}

  const playTranslatedText = async () => {
    if (!translatedText || translatedText === "") {
      Alert.alert(t('User.alert.error'), t('User.alert.audio_none'))
      return
    }

    try {
      setIsPlaying(true)

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      })

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

      const response = await fetch(`${BASE_URL}/translate`, {
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
      Alert.alert(t('User.alert.error'), t('User.alert.audio_fail'));
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
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.navButton, styles.activeButton]}
          onPress={navigateToTranslate}
        >
          <Text style={[styles.buttonText, styles.activeButtonText]}>번역</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, styles.inactiveButton]}
          onPress={navigateToMap}
        >
          <Text style={[styles.buttonText, styles.inactiveButtonText]}>주변 약국 찾기</Text>
        </TouchableOpacity>
      </View>
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
            <Ionicons name="close" size={30} color="#000" />
          </TouchableOpacity>
        <TextInput
          style={[styles.cardContent, styles.input,{paddingRight: 40}]}
          value={inputText}
          onChangeText={setInputText}
          placeholder={t('User.translate.input_placeholder')}
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
              <Text style={styles.translateText}>{t('User.translate.translate_btn')}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {renderPhraseModal()}
      {/* 리버스 */}
      <View style={styles.languageRow}>
        <TouchableOpacity onPress={swapLanguages}>
          <Fontisto name="arrow-swap" size={24} color="#333" />
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
              }, 100);
            }}
            style={styles.iconButton}
          >
            <Ionicons name="volume-high" size={24} color="#0057e7" />
          </TouchableOpacity>
        </View>
      </View>
            <TouchableOpacity
        style={styles.presetBtn}
        onPress={() => setShowPhraseModal(true)}
      >
        <Text style={styles.presetText}>{t('User.translate.see_FAQ')}</Text>
      </TouchableOpacity>

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
    buttonContainer: {
    flexDirection: 'row',
    marginTop: 30,
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
    alignItems: "center",
    justifyContent:"center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    height: 35,
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
  presetBtn: {
  backgroundColor: "#fa6666",
  padding: 12,
  borderRadius: 8,
  alignItems: "center",
  marginBottom: 20,
},
presetText: {
  color: "#fff",
  fontSize: 16,
  fontWeight: "600",
},
phraseItem: {
  paddingVertical: 12,
  paddingHorizontal: 12,
  borderRadius: 6,
  borderBottomColor: "#ddd",
  borderBottomWidth: 1,
  marginBottom: 6,
},
phraseText: {
  fontSize: 14,
  color: "#333",
},
})
