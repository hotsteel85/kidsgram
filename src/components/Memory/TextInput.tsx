import React from 'react';
import { View, Text, TextInput as RNTextInput, StyleSheet } from 'react-native';
import { colors, shadows } from '../../styles/colors';

interface TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  maxLength?: number;
}

export const TextInput: React.FC<TextInputProps> = ({ 
  value, 
  onChangeText, 
  placeholder = "메모를 입력하세요...",
  maxLength = 500
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>메모</Text>
        <Text style={styles.counter}>
          {value.length}/{maxLength}
        </Text>
      </View>
      
      <RNTextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textLight}
        multiline
        maxLength={maxLength}
        textAlignVertical="top"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  counter: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.textPrimary,
    minHeight: 120,
    ...shadows.small,
  },
}); 