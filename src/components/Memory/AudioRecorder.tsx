import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { colors, shadows } from '../../styles/colors';
import { AUDIO_RECORDING_LIMIT } from '../../utils/constants';

interface AudioRecorderProps {
  audioUri: string | null;
  onAudioChange: (uri: string | null) => void;
  isEditing?: boolean;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({ 
  audioUri, 
  onAudioChange,
  isEditing = false 
}) => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= AUDIO_RECORDING_LIMIT) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('권한 필요', '마이크 접근 권한이 필요합니다.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
      setRecordingTime(0);
    } catch (error) {
      console.error('녹음 시작 오류:', error);
      Alert.alert('오류', '녹음을 시작할 수 없습니다.');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setRecordingTime(0);
      
      if (uri) {
        onAudioChange(uri);
      }
    } catch (error) {
      console.error('녹음 중지 오류:', error);
      Alert.alert('오류', '녹음을 중지할 수 없습니다.');
    }
  };

  const playAudio = async () => {
    if (!audioUri) return;

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
        const { sound: newSound } = await Audio.Sound.createAsync({ uri: audioUri });
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
      console.error('재생 오류:', error);
      Alert.alert('오류', '오디오를 재생할 수 없습니다.');
    }
  };

  const removeAudio = () => {
    Alert.alert(
      '음성 삭제',
      '음성을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { text: '삭제', style: 'destructive', onPress: () => {
          onAudioChange(null);
          if (sound) {
            sound.unloadAsync();
            setSound(null);
          }
          setIsPlaying(false);
        }}
      ]
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>음성</Text>
      
      {audioUri ? (
        <View style={styles.audioContainer}>
          <TouchableOpacity style={styles.playButton} onPress={playAudio}>
            <Ionicons 
              name={isPlaying ? "pause" : "play"} 
              size={24} 
              color={colors.white} 
            />
          </TouchableOpacity>
          <View style={styles.audioInfo}>
            <Text style={styles.audioText}>음성 녹음</Text>
            <Text style={styles.audioTime}>00:30</Text>
          </View>
          <View style={styles.audioActions}>
            <TouchableOpacity style={styles.actionButton} onPress={startRecording}>
              <Ionicons name="mic" size={16} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={removeAudio}>
              <Ionicons name="trash" size={16} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.recordingContainer}>
          {isRecording ? (
            <View style={styles.recordingActive}>
              <View style={styles.recordingIndicator} />
              <Text style={styles.recordingText}>
                녹음 중... {formatTime(recordingTime)}
              </Text>
              <TouchableOpacity style={styles.stopButton} onPress={stopRecording}>
                <Ionicons name="stop" size={24} color={colors.white} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.recordButton} onPress={startRecording}>
              <Ionicons name="mic" size={32} color={colors.white} />
              <Text style={styles.recordText}>
                {isEditing ? '음성 다시 녹음' : '음성 녹음 (최대 30초)'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  recordingContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    ...shadows.small,
  },
  recordButton: {
    backgroundColor: colors.primary,
    borderRadius: 50,
    padding: 20,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  recordText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  recordingActive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  recordingIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.error,
  },
  recordingText: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  stopButton: {
    backgroundColor: colors.error,
    borderRadius: 25,
    padding: 12,
  },
  audioContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.small,
  },
  playButton: {
    backgroundColor: colors.primary,
    borderRadius: 25,
    padding: 12,
    marginRight: 16,
  },
  audioInfo: {
    flex: 1,
  },
  audioText: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  audioTime: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  audioActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: colors.gray,
  },
}); 