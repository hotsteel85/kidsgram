import React, { useState } from 'react';
import { Image, ImageProps, ActivityIndicator, View, StyleSheet } from 'react-native';
import { colors } from '../styles/colors';
import { Ionicons } from '@expo/vector-icons';

interface OptimizedImageProps extends Omit<ImageProps, 'source'> {
  uri: string;
  placeholderColor?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  uri,
  placeholderColor = colors.gray,
  style,
  ...props
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoadStart = () => {
    setLoading(true);
    setError(false);
  };

  const handleLoadEnd = () => {
    setLoading(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  if (error) {
    return (
      <View style={[style, styles.errorContainer, { backgroundColor: placeholderColor }]}>
        <Ionicons name="image-outline" size={32} color={colors.textLight} />
      </View>
    );
  }

  return (
    <View style={style}>
      <Image
        source={{ uri }}
        style={[style, styles.image]}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        {...props}
      />
      {loading && (
        <View style={[style, styles.loadingContainer]}>
          <ActivityIndicator color={colors.primary} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 