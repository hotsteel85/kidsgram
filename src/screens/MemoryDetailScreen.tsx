import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView,
  Image,
  Alert,
  Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useAuth } from '../hooks/useAuth';
import { useMemory } from '../hooks/useMemory';
import { colors, shadows } from '../styles/colors';
import { MemoryDetailScreenNavigationProp, MemoryDetailScreenRouteProp } from '../types/navigation';
import { Loading } from '../components/UI/Loading';
import { ErrorMessage } from '../components/UI/ErrorMessage';
import { getDateDisplay } from '../utils/dateUtils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Memory } from '../types';

interface MemoryDetailScreenProps {
  navigation: MemoryDetailScreenNavigationProp;
  route: MemoryDetailScreenRouteProp;
}

const { width: screenWidth } = Dimensions.get('window');

export const MemoryDetailScreen: React.FC<MemoryDetailScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const { user } = useAuth();
  const { getMemoryById, deleteMemoryData } = useMemory();
  const [memory, setMemory] = useState<Memory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const insets = useSafeAreaInsets();

  const memoryId = route.params.memoryId;

  useEffect(() => {
    loadMemory();
  }, [memoryId]);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const loadMemory = async () => {
    if (!memoryId) {
      setError('메모리 ID가 없습니다.');
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const memoryData = await getMemoryById(memoryId);
      
      if (!memoryData) {
        setError('메모리를 찾을 수 없습니다.');
        return;
      }

      setMemory(memoryData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '메모리를 불러올 수 없습니다.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const playAudio = async () => {
    if (!memory?.audioUrl) return;

    try {
      if (sound) {
        if (isPlaying) {
          await sound.stopAsync();
          setIsPlaying(false);
        } else {
          await sound.playAsync();
          setIsPlaying(true);
        }
      } else {
        const { sound: newSound } = await Audio.Sound.createAsync({ 
          uri: memory.audioUrl 
        });
        setSound(newSound);
        await newSound.playAsync();
        setIsPlaying(true);
        
        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            setIsPlaying(false);
          }
        });
      }
    } catch (error) {
      console.error('오디오 재생 오류:', error);
      Alert.alert('오류', '오디오를 재생할 수 없습니다.');
    }
  };

  const handleEdit = () => {
    if (!memory) return;
    
    navigation.navigate('Memory', { 
      date: memory.date,
      memoryId: memory.id 
    });
  };

  const handleDelete = () => {
    if (!memory) return;

    Alert.alert(
      '삭제 확인',
      '이 기록을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '삭제', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await deleteMemoryData(memory.id!);
              Alert.alert('성공', '기록이 삭제되었습니다.', [
                { text: '확인', onPress: () => navigation.goBack() }
              ]);
            } catch (error) {
              Alert.alert('오류', '삭제에 실패했습니다.');
            }
          }
        }
      ]
    );
  };

  const handleShare = () => {
    // TODO: 공유 기능 구현
    Alert.alert('공유', '공유 기능은 준비 중입니다.');
  };

  if (loading) {
    return <Loading message="기록을 불러오는 중..." />;
  }

  if (error) {
    return (
      <ErrorMessage 
        message={error} 
        onRetry={loadMemory}
      />
    );
  }

  if (!memory) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>메모리를 찾을 수 없습니다.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>기록 상세</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleEdit}>
            <Ionicons name="create-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={24} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.dateSection}>
          <Text style={styles.dateText}>{getDateDisplay(memory.date)}</Text>
          <Text style={styles.timeText}>
            {memory.createdAt.toLocaleTimeString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>

        {memory.photoUrl && (
          <View style={styles.photoSection}>
            <Image 
              source={{ uri: memory.photoUrl }} 
              style={styles.photo}
              resizeMode="cover"
            />
          </View>
        )}

        {memory.audioUrl && (
          <View style={styles.audioSection}>
            <TouchableOpacity style={styles.audioButton} onPress={playAudio}>
              <Ionicons 
                name={isPlaying ? "pause" : "play"} 
                size={32} 
                color={colors.white} 
              />
            </TouchableOpacity>
            <View style={styles.audioInfo}>
              <Text style={styles.audioTitle}>음성 녹음</Text>
              <Text style={styles.audioDuration}>00:30</Text>
            </View>
          </View>
        )}

        {memory.note && (
          <View style={styles.noteSection}>
            <Text style={styles.noteTitle}>메모</Text>
            <Text style={styles.noteText}>{memory.note}</Text>
          </View>
        )}

        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Ionicons name="images" size={20} color={colors.primary} />
            <Text style={styles.statText}>
              {memory.photoUrl ? '사진 있음' : '사진 없음'}
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Ionicons name="mic" size={20} color={colors.primary} />
            <Text style={styles.statText}>
              {memory.audioUrl ? '음성 있음' : '음성 없음'}
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Ionicons name="document-text" size={20} color={colors.primary} />
            <Text style={styles.statText}>
              {memory.note ? `${memory.note.length}자` : '메모 없음'}
            </Text>
          </View>
        </View>
      </ScrollView>
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
    minWidth: 40,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  dateSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  dateText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  timeText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
  },
  photoSection: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    ...shadows.medium,
  },
  photo: {
    width: '100%',
    height: screenWidth - 32,
    borderRadius: 16,
  },
  audioSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    ...shadows.small,
  },
  audioButton: {
    backgroundColor: colors.primary,
    borderRadius: 30,
    padding: 16,
    marginRight: 16,
  },
  audioInfo: {
    flex: 1,
  },
  audioTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  audioDuration: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  noteSection: {
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    ...shadows.small,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  noteText: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  statsSection: {
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 16,
    ...shadows.small,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginLeft: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
}); 