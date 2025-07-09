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
import { CalendarScreenProps } from '../types/navigation';
import { Memory } from '../types';
import { Loading } from '../components/UI/Loading';
import { ErrorMessage } from '../components/UI/ErrorMessage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMemory } from '../hooks/useMemory';
import { useFocusEffect } from '@react-navigation/native';

interface MarkedDates {
  [date: string]: {
    marked: boolean;
    dotColor: string;
    selected?: boolean;
    selectedColor?: string;
    selectedTextColor?: string;
  };
}

export const CalendarScreen: React.FC<CalendarScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const { memories, loading, error, loadMemories } = useMemory();
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  const [selectedDate, setSelectedDate] = useState<string>('');
  const insets = useSafeAreaInsets();

  // 화면이 포커스될 때마다 메모리 다시 로드
  useFocusEffect(
    React.useCallback(() => {
      loadMemories();
    }, [loadMemories])
  );

  const loadCalendarData = async () => {
    if (!user) return;

    try {
      await loadMemories();
    } catch (error) {
      console.error('메모리 로드 오류:', error);
    }
  };

  useEffect(() => {
    loadCalendarData();
  }, [user]);

  // memories가 변경될 때마다 달력 마킹 업데이트
  useEffect(() => {
    const marked: MarkedDates = {};
    memories.forEach(memory => {
      marked[memory.date] = {
        marked: true,
        dotColor: colors.primary,
      };
    });
    setMarkedDates(marked);
  }, [memories]);

  const handleDayPress = (day: DateData) => {
    const dateString = day.dateString;
    const memory = memories.find(m => m.date === dateString);
    
    if (memory && memory.id) {
      // 해당 날짜의 메모리가 있으면 상세 보기 또는 업데이트
      Alert.alert(
        `${dateString}의 기록`,
        '이 날의 기록을 보시겠습니까?',
        [
          { text: '업데이트', onPress: () => {
            navigation.navigate('Memory', { memory: { date: dateString } });
          }},
          { text: '상세보기', onPress: () => {
            navigation.navigate('MemoryDetail', { memory });
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
            navigation.navigate('Memory', { memory: { date: dateString } });
          }},
          { text: '취소', style: 'cancel' }
        ]
      );
    }
    
    // 선택된 날짜 표시
    setSelectedDate(dateString);
  };

  const handleAddMemory = () => {
    navigation.navigate('Memory');
  };

  const handleRefresh = () => {
    loadCalendarData();
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
        <View style={styles.headerButton} />
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
            textDayFontWeight: '600',
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