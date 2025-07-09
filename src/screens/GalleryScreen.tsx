import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  FlatList,
  RefreshControl,
  Alert,
  Dimensions,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { useMemory } from '../hooks/useMemory';
import { colors, shadows } from '../styles/colors';
import { GalleryScreenProps } from '../types/navigation';
import { Memory } from '../types';
import { MemoryCard } from '../components/Gallery/MemoryCard';
import { Loading } from '../components/UI/Loading';
import { ErrorMessage } from '../components/UI/ErrorMessage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

export const GalleryScreen: React.FC<GalleryScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const { 
    memories, 
    loading, 
    error, 
    loadMemories, 
    deleteMemoryData 
  } = useMemory();
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();
  const screenWidth = Dimensions.get('window').width;
  const numColumns = 3;
  const imageSize = Math.floor(screenWidth / numColumns);

  // 화면이 포커스될 때마다 메모리 다시 로드
  useFocusEffect(
    React.useCallback(() => {
      loadMemories();
    }, [loadMemories])
  );

  // 사진이 있는 기록만 필터링하고 날짜순으로 정렬 (최신순)
  const photoMemories = memories
    .filter(m => m.photoUrl)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMemories();
    setRefreshing(false);
  };

  const handleMemoryPress = (memory: Memory) => {
    if (memory.id) {
      navigation.navigate('MemoryDetail', { memory });
    }
  };

  const handleMemoryDelete = async (memory: Memory) => {
    Alert.alert(
      '삭제 확인',
      '이 기록을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '삭제', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await deleteMemoryData(memory.id!);
              Alert.alert('성공', '기록이 삭제되었습니다.');
            } catch (error) {
              Alert.alert('오류', '삭제에 실패했습니다.');
            }
          }
        }
      ]
    );
  };

  const handleAddMemory = () => {
    navigation.navigate('Memory');
  };

  // 인스타그램 스타일 그리드 렌더러
  const renderPhotoItem = ({ item }: { item: Memory }) => (
    <TouchableOpacity
      onPress={() => handleMemoryPress(item)}
      activeOpacity={0.8}
      style={{ width: imageSize, height: imageSize }}
    >
      <View style={styles.photoContainer}>
        <Image
          source={{ uri: item.photoUrl! }}
          style={styles.photoImage}
          resizeMode="cover"
        />
        
        {/* 날짜 오버레이 */}
        <View style={styles.dateOverlay}>
          <Text style={styles.dateText}>
            {new Date(item.date).toLocaleDateString('ko-KR', {
              month: '2-digit',
              day: '2-digit'
            }).replace('.', '').replace('.', '').replace(' ', '/')}
          </Text>
        </View>
        
        {/* 감정 이모티콘 오버레이 */}
        {item.emotion && (
          <View style={styles.emotionOverlay}>
            <Text style={styles.emotionText}>{item.emotion}</Text>
          </View>
        )}
        
        {/* 메모 오버레이 */}
        {item.note && (
          <View style={styles.noteOverlay}>
            <Text style={styles.noteText} numberOfLines={1}>
              {item.note}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  // 안내 메시지
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="images-outline" size={64} color={colors.textLight} />
      <Text style={styles.emptyTitle}>아직 사진 기록이 없어요</Text>
      <Text style={styles.emptySubtitle}>
        사진이 포함된 기록을 남겨보세요!
      </Text>
      <TouchableOpacity style={styles.addButton} onPress={handleAddMemory}>
        <Ionicons name="add" size={20} color={colors.white} />
        <Text style={styles.addButtonText}>새 기록 작성</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && !refreshing) {
    return <Loading message="갤러리를 불러오는 중..." />;
  }

  if (error) {
    return (
      <ErrorMessage 
        message={error} 
        onRetry={loadMemories}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerButton} />
        <Text style={styles.headerTitle}>갤러리</Text>
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={handleAddMemory}
        >
          <Ionicons name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={photoMemories}
        renderItem={renderPhotoItem}
        keyExtractor={(item) => item.id || item.date}
        numColumns={numColumns}
        key={numColumns}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={photoMemories.length === 0 ? { flex: 1 } : undefined}
      />
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
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  addButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    gap: 8,
  },
  addButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  photoContainer: {
    position: 'relative',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  dateOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    padding: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 4,
  },
  dateText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.white,
  },
  emotionOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 4,
  },
  emotionText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.white,
  },
  noteOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 4,
    borderRadius: 4,
  },
  noteText: {
    fontSize: 12,
    color: colors.white,
  },
}); 