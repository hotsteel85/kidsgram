import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  Alert,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { colors, shadows } from '../styles/colors';
import { CalendarScreenNavigationProp } from '../types/navigation';
import { Memory } from '../types';
import { Loading } from '../components/UI/Loading';
import { ErrorMessage } from '../components/UI/ErrorMessage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CalendarScreenProps {
  navigation: CalendarScreenNavigationProp;
}

interface MarkedDates {
  [date: string]: {
    marked: boolean;
    dotColor: string;
    selected?: boolean;
    selectedColor?: string;
  };
}

export const CalendarScreen: React.FC<CalendarScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  const loadMemories = async () => {
    if (!user) return;

    try {
      setError(null);
      // TODO: Firebase에서 메모리 데이터 로드
      // 임시 데이터로 테스트
      const mockMemories: Memory[] = [
        {
          id: '1',
          date: '2025-01-08',
          photoUrl: 'https://via.placeholder.com/300x300/FFBE98/FFFFFF?text=Photo',
          audioUrl: 'https://example.com/audio1.mp3',
          note: '오늘은 정말 좋은 하루였어요!',
          createdAt: new Date('2025-01-08'),
          userId: user.uid,
        },
        {
          id: '2',
          date: '2025-01-07',
          photoUrl: 'https://via.placeholder.com/300x300/B8E6B8/FFFFFF?text=Photo',
          note: '어제는 집에서 요리를 했어요.',
          createdAt: new Date('2025-01-07'),
          userId: user.uid,
        },
        {
          id: '3',
          date: '2025-01-05',
          audioUrl: 'https://example.com/audio3.mp3',
          note: '주말에 가족과 함께 영화를 봤어요.',
          createdAt: new Date('2025-01-05'),
          userId: user.uid,
        },
        {
          id: '4',
          date: '2025-01-03',
          note: '새해 첫 기록입니다.',
          createdAt: new Date('2025-01-03'),
          userId: user.uid,
        },
      ];
      
      setMemories(mockMemories);
      
      // 달력에 표시할 마킹 생성
      const marked: MarkedDates = {};
      mockMemories.forEach(memory => {
        marked[memory.date] = {
          marked: true,
          dotColor: colors.primary,
        };
      });
      setMarkedDates(marked);
      
    } catch (error) {
      console.error('메모리 로드 오류:', error);
      setError('메모리를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMemories();
  }, [user]);

  const handleDayPress = (day: DateData) => {
    const dateString = day.dateString;
    const memory = memories.find(m => m.date === dateString);
    
    if (memory && memory.id) {
      // 해당 날짜의 메모리가 있으면 상세 보기
      Alert.alert(
        `${dateString}의 기록`,
        '이 날의 기록을 보시겠습니까?',
        [
          { text: '보기', onPress: () => {
            navigation.navigate('MemoryDetail', { memoryId: memory.id! });
          }},
          { text: '편집', onPress: () => {
            navigation.navigate('Memory', { date: dateString });
          }},
          { text: '취소', style: 'cancel' }
        ]
      );
    } else {
      // 해당 날짜에 메모리가 없으면 새로 작성
      Alert.alert(
        `${dateString}`,
        '이 날의 기록을 작성하시겠습니까?',
        [
          { text: '작성하기', onPress: () => {
            navigation.navigate('Memory', { date: dateString });
          }},
          { text: '취소', style: 'cancel' }
        ]
      );
    }
    
    // 선택된 날짜 표시
    setSelectedDate(dateString);
  };

  const handleAddMemory = () => {
    navigation.navigate('Memory', {});
  };

  const handleRefresh = () => {
    setLoading(true);
    loadMemories();
  };

  if (loading) {
    return <Loading message="달력을 불러오는 중..." />;
  }

  if (error) {
    return (
      <ErrorMessage 
        message={error} 
        onRetry={handleRefresh}
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
        <Text style={styles.headerTitle}>달력</Text>
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={handleAddMemory}
        >
          <Ionicons name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Calendar
          onDayPress={handleDayPress}
          markedDates={{
            ...markedDates,
            [selectedDate]: {
              ...markedDates[selectedDate],
              selected: true,
              selectedColor: colors.primary,
            }
          }}
          theme={{
            backgroundColor: colors.background,
            calendarBackground: colors.white,
            textSectionTitleColor: colors.textPrimary,
            selectedDayBackgroundColor: colors.primary,
            selectedDayTextColor: colors.white,
            todayTextColor: colors.primary,
            dayTextColor: colors.textPrimary,
            textDisabledColor: colors.textLight,
            dotColor: colors.primary,
            selectedDotColor: colors.white,
            arrowColor: colors.primary,
            monthTextColor: colors.textPrimary,
            indicatorColor: colors.primary,
            textDayFontWeight: '500',
            textMonthFontWeight: 'bold',
            textDayHeaderFontWeight: '600',
            textDayFontSize: 16,
            textMonthFontSize: 18,
            textDayHeaderFontSize: 14,
          }}
          style={styles.calendar}
        />

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Ionicons name="images" size={24} color={colors.primary} />
            <Text style={styles.statNumber}>
              {memories.filter(m => m.photoUrl).length}
            </Text>
            <Text style={styles.statLabel}>사진</Text>
          </View>
          
          <View style={styles.statItem}>
            <Ionicons name="mic" size={24} color={colors.primary} />
            <Text style={styles.statNumber}>
              {memories.filter(m => m.audioUrl).length}
            </Text>
            <Text style={styles.statLabel}>음성</Text>
          </View>
          
          <View style={styles.statItem}>
            <Ionicons name="document-text" size={24} color={colors.primary} />
            <Text style={styles.statNumber}>
              {memories.filter(m => m.note).length}
            </Text>
            <Text style={styles.statLabel}>메모</Text>
          </View>
          
          <View style={styles.statItem}>
            <Ionicons name="calendar" size={24} color={colors.primary} />
            <Text style={styles.statNumber}>
              {memories.length}
            </Text>
            <Text style={styles.statLabel}>총 기록</Text>
          </View>
        </View>
      </View>
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
  content: {
    flex: 1,
  },
  calendar: {
    margin: 16,
    borderRadius: 16,
    ...shadows.medium,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: colors.white,
    margin: 16,
    borderRadius: 16,
    ...shadows.small,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
}); 