import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../../styles/colors';

interface GoogleSignInProps {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export const GoogleSignIn: React.FC<GoogleSignInProps> = ({ 
  onPress, 
  loading = false, 
  disabled = false 
}) => {
  const handlePress = () => {
    if (!disabled && !loading) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        disabled && styles.disabled,
        shadows.medium
      ]}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <Ionicons 
          name="logo-google" 
          size={24} 
          color={colors.textPrimary} 
        />
        <Text style={styles.text}>
          {loading ? '로그인 중...' : 'Google로 로그인'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.white,
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderWidth: 1,
    borderColor: colors.gray,
    minWidth: 280,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  disabled: {
    opacity: 0.6,
  },
}); 