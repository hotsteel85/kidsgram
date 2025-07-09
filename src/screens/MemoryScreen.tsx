import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { useMemory } from '../hooks/useMemory';
import { colors, shadows } from '../styles/colors';
import { MemoryScreenProps } from '../types/navigation';
import { DateSelector } from '../components/Memory/DateSelector';
import { PhotoUpload } from '../components/Memory/PhotoUpload';
import { AudioRecorder } from '../components/Memory/AudioRecorder';
import { EmotionSelector } from '../components/Memory/EmotionSelector';
import { TextInput } from '../components/Memory/TextInput';
import { formatDate } from '../utils/dateUtils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Memory } from '../types';
import { useFocusEffect } from '@react-navigation/native';

export const MemoryScreen: React.FC<MemoryScreenProps> = ({ navigation, route }) => {
  const { user } = useAuth();
  const { getMemoryByDate, saveMemoryData, updateMemoryData, getMemoryById } = useMemory();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [originalMemory, setOriginalMemory] = useState<Memory | null>(null);
  const [error, setError] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  // 라우트 파라미터는 다른 화면에서 특정 기록을 수정/조회할 때 사용
  const memoryParam = (route.params as any)?.memory;

  // 화면이 포커스될 때마다 폼 초기화
  useFocusEffect(
    React.useCallback(() => {
      // 라우트 파라미터가 없으면 폼 초기화
      if (!route.params?.memory) {
        setSelectedDate(new Date());
        setPhotoUri(null);
        setAudioUri(null);
        setNote('');
        setIsEditing(false);
        setOriginalMemory(null);
        setError(null);
      }
    }, [route.params?.memory])
  );

  useEffect(() => {
    // 라우트 파라미터가 있을 때만 기존 기록 로드
    if (memoryParam?.id) {
      loadExistingMemoryById(memoryParam.id);
    } else if (memoryParam?.date) {
      const date = new Date(memoryParam.date);
      setSelectedDate(date);
      loadExistingMemoryByDate(date);
    }
  }, [memoryParam]);

  const loadExistingMemoryById = async (memoryId: string) => {
    setIsLoading(true);
    try {
      const memory = await getMemoryById(memoryId);
      if (memory) {
        setOriginalMemory(memory);
        setSelectedDate(new Date(memory.date));
        setPhotoUri(memory.photoUrl || null);
        setAudioUri(memory.audioUrl || null);
        setNote(memory.note || '');
        setSelectedEmotion(memory.emotion || null);
        setIsEditing(true);
      } else {
        setError('메모리를 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('메모리 로드 오류:', error);
      setError('메모리를 불러올 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadExistingMemoryByDate = async (date: Date) => {
    if (isEditing) return; // 이미 수정 모드이면 날짜로 다시 로드하지 않음

    setIsLoading(true);
    try {
      const dateString = formatDate(date);
      const existingMemory = await getMemoryByDate(dateString);
      
      if (existingMemory) {
        Alert.alert(
          '기존 기록 확인',
          '이 날짜에 이미 기록이 있습니다. 기존 기록을 업데이트하시겠습니까?',
          [
            { text: '새로 작성', style: 'destructive', onPress: () => {
              setPhotoUri(null);
              setAudioUri(null);
              setNote('');
              setSelectedEmotion(null);
              setIsEditing(false);
              setOriginalMemory(null);
            }},
            { text: '기존 기록 업데이트', onPress: () => {
              setOriginalMemory(existingMemory);
              setPhotoUri(existingMemory.photoUrl || null);
              setAudioUri(existingMemory.audioUrl || null);
              setNote(existingMemory.note || '');
              setSelectedEmotion(existingMemory.emotion || null);
              setIsEditing(true);
            }},
            { text: '취소', style: 'cancel' }
          ]
        );
      }
    } catch (err) {
      console.error('기존 메모리 로드 오류:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!note.trim() && !photoUri && !audioUri) {
      Alert.alert('알림', '사진, 음성, 메모 중 하나 이상을 입력해주세요.');
      return;
    }

    setIsSaving(true);
    try {
      const dateString = formatDate(selectedDate);
      console.log('저장 시도:', { dateString, selectedDate, photoUri: !!photoUri, audioUri: !!audioUri, note: note.length });
      
      // 같은 날짜의 기존 기록 확인
      const existingMemory = await getMemoryByDate(dateString);
      console.log('기존 기록 확인:', existingMemory ? '있음' : '없음');
      
      if (existingMemory && !isEditing) {
        // 기존 기록이 있고 현재 수정 모드가 아닌 경우
        Alert.alert(
          '기존 기록 확인',
          '이 날짜에 이미 기록이 있습니다. 기존 기록을 업데이트하시겠습니까?',
          [
            { text: '취소', style: 'cancel' },
            { text: '업데이트', onPress: async () => {
              try {
                console.log('업데이트 시작');
                await saveMemoryData(selectedDate, photoUri || undefined, audioUri || undefined, note, selectedEmotion || undefined);
                console.log('업데이트 완료');
                const navigateToTab = () => {
                  const hasPhoto = photoUri !== null;
                  if (hasPhoto) {
                    navigation.navigate('Gallery');
                  } else {
                    navigation.navigate('Calendar');
                  }
                };
                Alert.alert('성공', '기록이 업데이트되었습니다!', [
                  { text: '확인', onPress: navigateToTab }
                ]);
              } catch (error) {
                console.error('저장 오류:', error);
                Alert.alert('오류', error instanceof Error ? error.message : '저장에 실패했습니다.');
              }
            }}
          ]
        );
        setIsSaving(false);
        return;
      }

      // 새 기록 저장 또는 기존 기록 수정
      console.log('새 기록 저장 시작');
      const memoryId = await saveMemoryData(selectedDate, photoUri || undefined, audioUri || undefined, note, selectedEmotion || undefined);
      console.log('저장 완료, memoryId:', memoryId);
      
      const navigateToTab = () => {
        const hasPhoto = photoUri !== null;
        if (hasPhoto) {
          navigation.navigate('Gallery');
        } else {
          navigation.navigate('Calendar');
        }
      };

      const message = isEditing ? '기록이 업데이트되었습니다!' : '기록이 저장되었습니다!';
      Alert.alert('성공', message, [
        { text: '확인', onPress: navigateToTab }
      ]);
    } catch (error) {
      console.error('저장 오류:', error);
      Alert.alert('오류', error instanceof Error ? error.message : '저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // 탭 네비게이션에서는 뒤로가기 대신 홈(캘린더)으로 보내거나, 아무것도 안하도록 설정 가능
    // 우선은 아무것도 하지 않도록 비워둡니다.
    // 만약 스택으로 열렸을 경우를 대비해 goBack() 유지
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const hasChanges = () => {
    if (!originalMemory) return true;
    
    return (
      formatDate(selectedDate) !== originalMemory.date ||
      photoUri !== originalMemory.photoUrl ||
      audioUri !== originalMemory.audioUrl ||
      note.trim() !== (originalMemory.note || '') ||
      selectedEmotion !== (originalMemory.emotion || null)
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            {isEditing ? '기록을 불러오는 중...' : '기록을 확인하는 중...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerButton} />
        <Text style={styles.headerTitle}>
          {isEditing ? '기록 수정' : '새 기록'}
        </Text>
        <TouchableOpacity 
          style={[
            styles.headerButton, 
            (!hasChanges() || isSaving) && styles.disabledButton
          ]} 
          onPress={handleSave}
          disabled={!hasChanges() || isSaving}
        >
          <Text style={[
            styles.saveButtonText, 
            (!hasChanges() || isSaving) && styles.disabledText
          ]}>
            {isSaving ? '저장 중...' : (isEditing ? '수정' : '저장')}
          </Text>
        </TouchableOpacity>
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <DateSelector 
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />

          <View style={styles.sections}>
            <PhotoUpload 
              photoUri={photoUri}
              onPhotoChange={setPhotoUri}
            />

            <View style={styles.audioEmotionRow}>
              <AudioRecorder 
                audioUri={audioUri}
                onAudioChange={setAudioUri}
              />

              <EmotionSelector 
                selectedEmotion={selectedEmotion}
                onEmotionChange={setSelectedEmotion}
              />
            </View>

            <TextInput 
              value={note}
              onChangeText={setNote}
              placeholder="오늘의 메모를 작성해보세요..."
            />
          </View>

          {isEditing && (
            <View style={styles.editInfo}>
              <Ionicons name="information-circle" size={16} color={colors.textSecondary} />
              <Text style={styles.editInfoText}>
                이 날짜의 기존 기록을 업데이트합니다.
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray,
  },
  headerButton: {
    padding: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledText: {
    color: colors.textLight,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  sections: {
    gap: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  editInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  editInfoText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  audioEmotionRow: {
    flexDirection: 'row',
    gap: 24,
  },
}); 