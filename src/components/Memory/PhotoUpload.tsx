import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors, shadows } from '../../styles/colors';

interface PhotoUploadProps {
  photoUri: string | null;
  onPhotoChange: (uri: string | null) => void;
  isEditing?: boolean;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({ 
  photoUri, 
  onPhotoChange,
  isEditing = false 
}) => {
  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '사진 접근 권한이 필요합니다.');
      return false;
    }
    return true;
  };

  const requestCameraPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '카메라 접근 권한이 필요합니다.');
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      onPhotoChange(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      onPhotoChange(result.assets[0].uri);
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      '사진 선택',
      '어떤 방법으로 사진을 추가하시겠습니까?',
      [
        { text: '카메라', onPress: takePhoto },
        { text: '갤러리', onPress: pickImage },
        { text: '취소', style: 'cancel' }
      ]
    );
  };

  const removePhoto = () => {
    Alert.alert(
      '사진 삭제',
      '사진을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { text: '삭제', style: 'destructive', onPress: () => onPhotoChange(null) }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>사진</Text>
      
      {photoUri ? (
        <View style={styles.photoContainer}>
          <Image source={{ uri: photoUri }} style={styles.photo} />
          <View style={styles.photoActions}>
            <TouchableOpacity style={styles.actionButton} onPress={showImageOptions}>
              <Ionicons name="camera" size={20} color={colors.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={removePhoto}>
              <Ionicons name="trash" size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity style={styles.uploadButton} onPress={showImageOptions}>
          <Ionicons name="camera" size={32} color={colors.primary} />
          <Text style={styles.uploadText}>
            {isEditing ? '사진 변경' : '사진 추가'}
          </Text>
        </TouchableOpacity>
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
  uploadButton: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.small,
    borderWidth: 0,
    borderStyle: 'solid',
    borderColor: 'transparent',
  },
  uploadText: {
    marginTop: 8,
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  photoContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    ...shadows.medium,
  },
  photo: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  photoActions: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 8,
  },
  photoSection: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
}); 