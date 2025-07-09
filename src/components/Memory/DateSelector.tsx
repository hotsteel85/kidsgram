import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../../styles/colors';
import { formatDate, getDateDisplay, isToday } from '../../utils/dateUtils';

interface DateSelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export const DateSelector: React.FC<DateSelectorProps> = ({ 
  selectedDate, 
  onDateChange 
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleTodayPress = () => {
    onDateChange(new Date());
    setShowDatePicker(false);
  };

  const handleDateChange = (daysOffset: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + daysOffset);
    onDateChange(newDate);
  };

  const handleCustomDateSelect = (date: Date) => {
    onDateChange(date);
    setShowDatePicker(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>날짜 선택</Text>
      
      <View style={styles.dateDisplay}>
        <TouchableOpacity 
          style={styles.dateButton} 
          onPress={() => setShowDatePicker(true)}
        >
          <Ionicons name="calendar-outline" size={20} color={colors.primary} />
          <Text style={styles.dateText}>
            {getDateDisplay(formatDate(selectedDate))}
          </Text>
          <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={[styles.quickButton, isToday(selectedDate) && styles.activeButton]} 
          onPress={handleTodayPress}
        >
          <Text style={[styles.quickButtonText, isToday(selectedDate) && styles.activeButtonText]}>
            오늘
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickButton} 
          onPress={() => handleDateChange(-1)}
        >
          <Text style={styles.quickButtonText}>어제</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickButton} 
          onPress={() => handleDateChange(-7)}
        >
          <Text style={styles.quickButtonText}>1주 전</Text>
        </TouchableOpacity>
      </View>

      {/* 간단한 날짜 선택 모달 */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>날짜 선택</Text>
            
            {/* 여기에 실제 달력 컴포넌트가 들어갈 예정 */}
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalButton} 
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.modalButtonText}>취소</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  dateDisplay: {
    marginBottom: 16,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray,
    ...shadows.small,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    marginLeft: 12,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickButton: {
    flex: 1,
    backgroundColor: colors.white,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray,
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  quickButtonText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  activeButtonText: {
    color: colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  modalButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  modalButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
}); 