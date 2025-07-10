import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../../styles/colors';

interface EmotionSelectorProps {
  selectedEmotion: string | null;
  onEmotionChange: (emotion: string | null) => void;
}

const EMOTIONS = [
  { emoji: '😢', label: '눈물이 맺혀요', shortLabel: '눈물' },
  { emoji: '😕', label: '살짝 속상해', shortLabel: '속상' },
  { emoji: '😐', label: '무던한 하루', shortLabel: '무던' },
  { emoji: '🙂', label: '기분이 좋아요', shortLabel: '좋음' },
  { emoji: '😊', label: '행복이 가득해', shortLabel: '행복' },
];

export const EmotionSelector: React.FC<EmotionSelectorProps> = ({
  selectedEmotion,
  onEmotionChange,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const selectedEmotionData = EMOTIONS.find(e => e.emoji === selectedEmotion);

  const handleEmotionPress = (emotion: string) => {
    if (selectedEmotion === emotion) {
      onEmotionChange(null);
    } else {
      onEmotionChange(emotion);
    }
    setIsModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>오늘의 감정</Text>
      
      <TouchableOpacity 
        style={styles.dropdownButton}
        onPress={() => setIsModalVisible(true)}
        activeOpacity={0.7}
      >
        <View style={styles.dropdownContent}>
          {selectedEmotionData ? (
            <>
              <Text style={styles.selectedEmoji}>{selectedEmotionData.emoji}</Text>
              <Text
                style={[
                  styles.selectedLabel,
                  selectedEmotion === selectedEmotionData.emoji && styles.selectedEmotionLabel
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {selectedEmotionData.shortLabel}
              </Text>
            </>
          ) : (
            <Text style={styles.placeholderText}>감정 선택</Text>
          )}
        </View>
        <Ionicons 
          name="chevron-down" 
          size={20} 
          color={colors.textSecondary} 
        />
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>감정 선택</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.emotionList}>
              {EMOTIONS.map((emotion) => (
                <TouchableOpacity
                  key={emotion.emoji}
                  style={[
                    styles.emotionItem,
                    selectedEmotion === emotion.emoji && styles.selectedEmotionItem
                  ]}
                  onPress={() => handleEmotionPress(emotion.emoji)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.emotionEmoji}>{emotion.emoji}</Text>
                  <Text
                    style={[
                      styles.emotionLabel,
                      selectedEmotion === emotion.emoji && styles.selectedEmotionLabel
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {emotion.label}
                  </Text>
                  {selectedEmotion === emotion.emoji && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  dropdownButton: {
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadows.small,
    minWidth: 140,
    maxWidth: 200,
    minHeight: 56,
  },
  dropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    height: '100%',
  },
  selectedEmoji: {
    fontSize: 22,
    marginRight: 12,
  },
  selectedLabel: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '500',
    flexShrink: 1,
    flex: 1,
  },
  placeholderText: {
    fontSize: 16,
    color: colors.textLight,
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
    width: '80%',
    maxWidth: 300,
    ...shadows.medium,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  emotionList: {
    padding: 16,
  },
  emotionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedEmotionItem: {
    backgroundColor: colors.primaryLight,
  },
  emotionEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  emotionLabel: {
    fontSize: 16,
    color: colors.textPrimary,
    flex: 1,
  },
  selectedEmotionLabel: {
    color: colors.primary,
    fontWeight: '600',
  },
}); 