import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Animated,
  ImageBackground,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, Href } from 'expo-router';
import { colors, spacing, typography } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_HEIGHT = 220;
const AUTO_SCROLL_INTERVAL = 5000;

export interface BannerSlide {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  buttonText?: string;
  link?: string;
  backgroundColor?: string;
}

interface HeroBannerProps {
  slides: BannerSlide[];
  autoScroll?: boolean;
  height?: number;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  slides,
  autoScroll = true,
  height = BANNER_HEIGHT,
}) => {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  // Auto scroll effect
  useEffect(() => {
    if (!autoScroll || slides.length <= 1) return;

    const interval = setInterval(() => {
      const nextIndex = (activeIndex + 1) % slides.length;
      flatListRef.current?.scrollToOffset({
        offset: nextIndex * SCREEN_WIDTH,
        animated: true,
      });
      setActiveIndex(nextIndex);
    }, AUTO_SCROLL_INTERVAL);

    return () => clearInterval(interval);
  }, [activeIndex, autoScroll, slides.length]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / SCREEN_WIDTH);
    if (index !== activeIndex && index >= 0 && index < slides.length) {
      setActiveIndex(index);
    }
  };

  const handlePress = (slide: BannerSlide) => {
    if (slide.link) {
      router.push(slide.link as Href);
    }
  };

  const renderSlide = ({ item }: { item: BannerSlide }) => (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={() => handlePress(item)}
      style={[styles.slideContainer, { height }]}
    >
      <ImageBackground
        source={{ uri: item.imageUrl }}
        style={styles.slideImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['transparent', colors.overlayDark]}
          style={styles.gradient}
        >
          <View style={styles.slideContent}>
            <Text style={styles.slideTitle}>{item.title}</Text>
            {item.subtitle && (
              <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
            )}
            {item.buttonText && (
              <View style={styles.slideButton}>
                <Text style={styles.slideButtonText}>{item.buttonText}</Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );

  if (slides.length === 0) return null;

  return (
    <View style={styles.container}>
      <Animated.FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
      />

      {/* Pagination Dots */}
      {slides.length > 1 && (
        <View style={styles.pagination}>
          {slides.map((_, index) => {
            const inputRange = [
              (index - 1) * SCREEN_WIDTH,
              index * SCREEN_WIDTH,
              (index + 1) * SCREEN_WIDTH,
            ];

            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 20, 8],
              extrapolate: 'clamp',
            });

            const dotOpacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.4, 1, 0.4],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  {
                    width: dotWidth,
                    opacity: dotOpacity,
                  },
                ]}
              />
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  slideContainer: {
    width: SCREEN_WIDTH,
    overflow: 'hidden',
  },
  slideImage: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  gradient: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  slideContent: {
    padding: spacing.lg,
  },
  slideTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.surface,
    marginBottom: spacing.xs,
    textShadowColor: colors.overlay,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  slideSubtitle: {
    fontSize: typography.fontSize.md,
    color: colors.overlayWhiteMedium,
    marginBottom: spacing.md,
  },
  slideButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: spacing.borderRadius.md,
  },
  slideButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.primary,
  },
  pagination: {
    position: 'absolute',
    bottom: spacing.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surface,
    marginHorizontal: 3,
  },
});
