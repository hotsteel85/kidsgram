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
import { MemoryScreenNavigationProp, MemoryScreenRouteProp } from '../types/navigation';
import { DateSelector } from '../components/Memory/DateSelector';
import { PhotoUpload } from '../components/Memory/PhotoUpload';
import { AudioRecorder } from '../components/Memory/AudioRecorder';
import { TextInput } from '../components/Memory/TextInput';
import { formatDate } from '../utils/dateUtils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Memory } from '../types';

interface MemoryScreenProps {
  navigation: MemoryScreenNavigationProp;
  route: MemoryScreenRouteProp;
}

export const MemoryScreen: React.FC<MemoryScreenProps> = ({ navigation, route }) => {
  const { user } = useAuth();
  const { getMemoryByDate, saveMemoryData, updateMemoryData, getMemoryById } = useMemory();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [originalMemory, setOriginalMemory] = useState<Memory | null>(null);
  const [error, setError] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  // 라우트에서 전달받은 날짜나 메모리 ID가 있으면 사용
  useEffect(() => {
    if (route.params?.memoryId) {
      loadExistingMemoryById(route.params.memoryId);
    } else if (route.params?.date) {
      const date = new Date(route.params.date);
      setSelectedDate(date);
      loadExistingMemoryByDate(date);
    }
  }, [route.params]);

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
    setIsLoading(true);
    try {
      const dateString = formatDate(date);
      const existingMemory = await getMemoryByDate(dateString);
      
      if (existingMemory) {
        setOriginalMemory(existingMemory);
        setPhotoUri(existingMemory.photoUrl || null);
        setAudioUri(existingMemory.audioUrl || null);
        setNote(existingMemory.note || '');
        setIsEditing(true);
        
        Alert.alert(
          '기존 기록',
          '이 날짜에 이미 기록이 있습니다. 수정하시겠습니까?',
          [
            { text: '새로 작성', onPress: () => {
              setPhotoUri(null);
              setAudioUri(null);
              setNote('');
              setIsEditing(false);
              setOriginalMemory(null);
            }},
            { text: '수정하기', onPress: () => {
              // 이미 설정됨
            }},
            { text: '취소', style: 'cancel', onPress: () => navigation.goBack() }
          ]
        );
      }
    } catch (error) {
      console.error('기존 메모리 로드 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      Alert.alert('오류', '로그인이 필요합니다.');
      return;
    }

    if (!photoUri && !audioUri && !note.trim()) {
      Alert.alert('알림', '최소 하나의 내용을 입력해주세요.');
      return;
    }

    setIsSaving(true);
    try {
      if (isEditing && originalMemory) {
        // 기존 메모리 업데이트
        await updateMemoryData(originalMemory.id!, {
          date: formatDate(selectedDate),
          photoUrl: photoUri || undefined,
          audioUrl: audioUri || undefined,
          note: note.trim() || undefined,
        });
        
        Alert.alert('성공', '기록이 수정되었습니다!', [
          { text: '확인', onPress: () => navigation.goBack() }
        ]);
      } else {
        // 새 메모리 저장
        await saveMemoryData(selectedDate, photoUri || undefined, audioUri || undefined, note);
        
        Alert.alert('성공', '기록이 저장되었습니다!', [
          { text: '확인', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      console.error('저장 오류:', error);
      Alert.alert('오류', error instanceof Error ? error.message : '저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (photoUri || audioUri || note.trim()) {
      Alert.alert(
        '작성 취소',
        '작성 중인 내용이 있습니다. 정말 취소하시겠습니까?',
        [
          { text: '계속 작성', style: 'cancel' },
          { text: '취소', style: 'destructive', onPress: () => navigation.goBack() }
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const hasChanges = () => {
    if (!originalMemory) return true;
    
    return (
      formatDate(selectedDate) !== originalMemory.date ||
      photoUri !== originalMemory.photoUrl ||
      audioUri !== originalMemory.audioUrl ||
      note.trim() !== (originalMemory.note || '')
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
        <TouchableOpacity style={styles.headerButton} onPress={handleCancel}>
          <Ionicons name="close" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
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

            <AudioRecorder 
              audioUri={audioUri}
              onAudioChange={setAudioUri}
            />

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
                기존 기록을 수정하고 있습니다.
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
}); 