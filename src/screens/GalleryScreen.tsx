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
import { GalleryScreenNavigationProp } from '../types/navigation';
import { Memory } from '../types';
import { MemoryCard } from '../components/Gallery/MemoryCard';
import { Loading } from '../components/UI/Loading';
import { ErrorMessage } from '../components/UI/ErrorMessage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface GalleryScreenProps {
  navigation: GalleryScreenNavigationProp;
}

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

  // 사진이 있는 기록만 필터링
  const photoMemories = memories.filter(m => m.photoUrl);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMemories();
    setRefreshing(false);
  };

  const handleMemoryPress = (memory: Memory) => {
    if (memory.id) {
      navigation.navigate('MemoryDetail', { memoryId: memory.id });
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
    navigation.navigate('Memory', {});
  };

  // 인스타그램 스타일 그리드 렌더러
  const renderPhotoItem = ({ item }: { item: Memory }) => (
    <TouchableOpacity
      onPress={() => handleMemoryPress(item)}
      activeOpacity={0.8}
      style={{ width: imageSize, height: imageSize }}
    >
      <Image
        source={{ uri: item.photoUrl! }}
        style={{ width: imageSize, height: imageSize }}
        resizeMode="cover"
      />
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
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
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
}); 