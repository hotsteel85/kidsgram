import React, { useState, useCallback, memo } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { colors, shadows } from '../../styles/colors';
import { Memory } from '../../types';
import { getDateDisplay } from '../../utils/dateUtils';

interface MemoryCardProps {
  memory: Memory;
  onPress: () => void;
  onLongPress?: () => void;
}

export const MemoryCard: React.FC<MemoryCardProps> = memo(({ 
  memory, 
  onPress, 
  onLongPress 
}) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const playAudio = useCallback(async () => {
    if (!memory.audioUrl) return;

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
  }, [memory.audioUrl, sound, isPlaying]);

  const handleLongPress = useCallback(() => {
    if (onLongPress) {
      onLongPress();
    }
  }, [onLongPress]);

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress}
      onLongPress={handleLongPress}
      activeOpacity={0.8}
    >
      {memory.photoUrl && (
        <Image 
          source={{ uri: memory.photoUrl }} 
          style={styles.photo}
          resizeMode="cover"
        />
      )}
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.date}>{getDateDisplay(memory.date)}</Text>
          <View style={styles.indicators}>
            {memory.photoUrl && (
              <Ionicons name="camera" size={16} color={colors.primary} />
            )}
            {memory.audioUrl && (
              <TouchableOpacity onPress={playAudio} style={styles.audioButton}>
                <Ionicons 
                  name={isPlaying ? "pause" : "play"} 
                  size={16} 
                  color={colors.primary} 
                />
              </TouchableOpacity>
            )}
            {memory.note && (
              <Ionicons name="document-text" size={16} color={colors.primary} />
            )}
          </View>
        </View>
        
        {memory.note && (
          <Text style={styles.note} numberOfLines={3}>
            {memory.note}
          </Text>
        )}
        
        {!memory.photoUrl && !memory.note && memory.audioUrl && (
          <View style={styles.audioOnly}>
            <TouchableOpacity style={styles.audioPlayButton} onPress={playAudio}>
              <Ionicons 
                name={isPlaying ? "pause" : "play"} 
                size={24} 
                color={colors.white} 
              />
            </TouchableOpacity>
            <Text style={styles.audioText}>음성 녹음</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
});

MemoryCard.displayName = 'MemoryCard';

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    ...shadows.medium,
  },
  photo: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  date: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  indicators: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  audioButton: {
    padding: 4,
  },
  note: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  audioOnly: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  audioPlayButton: {
    backgroundColor: colors.primary,
    borderRadius: 25,
    padding: 12,
  },
  audioText: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '500',
  },
}); 