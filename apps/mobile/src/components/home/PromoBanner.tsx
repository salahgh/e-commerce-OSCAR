import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { spacing } from '../../theme';

interface PromoBannerProps {
  imageUrl: string;
  onPress?: () => void;
  height?: number;
}

export const PromoBanner: React.FC<PromoBannerProps> = ({
  imageUrl,
  onPress,
  height = 190,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, { height }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.9 : 1}
      disabled={!onPress}
    >
      <Image
        source={{ uri: imageUrl }}
        style={styles.image}
        contentFit="contain"
        transition={300}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    borderRadius: spacing.borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.xl,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
