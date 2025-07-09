import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../styles/colors';

interface CalendarDotProps {
  color?: string;
  size?: number;
}

export const CalendarDot: React.FC<CalendarDotProps> = ({ 
  color = colors.primary, 
  size = 8 
}) => {
  return (
    <View 
      style={[
        styles.dot, 
        { 
          backgroundColor: color,
          width: size,
          height: size,
          borderRadius: size / 2,
        }
      ]} 
    />
  );
};

const styles = StyleSheet.create({
  dot: {
    marginTop: 2,
  },
}); 