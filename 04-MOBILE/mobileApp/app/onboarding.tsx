import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Animated,
  StatusBar,
  Image,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../src/theme';
import { Button } from '../src/components/ui';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const ONBOARDING_KEY = '@oscar_onboarding_complete';

interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  backgroundColor: string;
  iconColor: string;
}

const slides: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Discover Fashion',
    description: 'Explore the latest trends in fashion with our curated collection of premium clothing and accessories.',
    icon: 'shirt-outline',
    backgroundColor: colors.primary,
    iconColor: colors.secondary,
  },
  {
    id: '2',
    title: 'Easy Shopping',
    description: 'Browse thousands of products, compare prices, and add your favorites to cart with just a tap.',
    icon: 'cart-outline',
    backgroundColor: colors.accent,
    iconColor: colors.primary,
  },
  {
    id: '3',
    title: 'Secure Checkout',
    description: 'Multiple payment options including CIB and BaridiMob. Your transactions are always safe with us.',
    icon: 'shield-checkmark-outline',
    backgroundColor: '#2C3E50',
    iconColor: colors.success,
  },
  {
    id: '4',
    title: 'Fast Delivery',
    description: 'Get your orders delivered right to your doorstep across Algeria with real-time tracking.',
    icon: 'rocket-outline',
    backgroundColor: colors.primaryDark,
    iconColor: colors.secondary,
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / SCREEN_WIDTH);
    if (index !== currentIndex && index >= 0 && index < slides.length) {
      setCurrentIndex(index);
    }
  };

  const goToSlide = (index: number) => {
    flatListRef.current?.scrollToOffset({
      offset: index * SCREEN_WIDTH,
      animated: true,
    });
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      goToSlide(currentIndex + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
      router.replace('/(auth)/login');
    }
  };

  const renderSlide = ({ item, index }: { item: OnboardingSlide; index: number }) => {
    const inputRange = [
      (index - 1) * SCREEN_WIDTH,
      index * SCREEN_WIDTH,
      (index + 1) * SCREEN_WIDTH,
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.8, 1, 0.8],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.4, 1, 0.4],
      extrapolate: 'clamp',
    });

    const translateY = scrollX.interpolate({
      inputRange,
      outputRange: [50, 0, 50],
      extrapolate: 'clamp',
    });

    return (
      <View style={[styles.slide, { backgroundColor: item.backgroundColor }]}>
        <Animated.View
          style={[
            styles.slideContent,
            {
              opacity,
              transform: [{ scale }, { translateY }],
            },
          ]}
        >
          {/* Icon Container */}
          <View style={[styles.iconContainer, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
            <Ionicons name={item.icon} size={100} color={item.iconColor} />
          </View>

          {/* Text Content */}
          <Text style={styles.slideTitle}>{item.title}</Text>
          <Text style={styles.slideDescription}>{item.description}</Text>
        </Animated.View>
      </View>
    );
  };

  const renderPagination = () => {
    return (
      <View style={styles.paginationContainer}>
        {slides.map((_, index) => {
          const inputRange = [
            (index - 1) * SCREEN_WIDTH,
            index * SCREEN_WIDTH,
            (index + 1) * SCREEN_WIDTH,
          ];

          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 24, 8],
            extrapolate: 'clamp',
          });

          const dotOpacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.4, 1, 0.4],
            extrapolate: 'clamp',
          });

          return (
            <TouchableOpacity
              key={index}
              onPress={() => goToSlide(index)}
              activeOpacity={0.8}
            >
              <Animated.View
                style={[
                  styles.dot,
                  {
                    width: dotWidth,
                    opacity: dotOpacity,
                  },
                ]}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const isLastSlide = currentIndex === slides.length - 1;

  return (
    <View style={[styles.container, { backgroundColor: slides[currentIndex].backgroundColor }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Skip Button */}
      <TouchableOpacity
        style={[styles.skipButton, { top: insets.top + spacing.md }]}
        onPress={handleSkip}
        activeOpacity={0.7}
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Slides */}
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

      {/* Bottom Controls */}
      <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + spacing.xl }]}>
        {/* Pagination */}
        {renderPagination()}

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {isLastSlide ? (
            <Button
              title="Get Started"
              onPress={completeOnboarding}
              variant="secondary"
              fullWidth
              style={styles.getStartedButton}
              textStyle={styles.getStartedButtonText}
            />
          ) : (
            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNext}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-forward" size={24} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    right: spacing.lg,
    zIndex: 10,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  skipText: {
    fontSize: typography.fontSize.md,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: typography.fontWeight.medium,
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
  },
  slideContent: {
    alignItems: 'center',
    maxWidth: 320,
  },
  iconContainer: {
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing['4xl'],
  },
  slideTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.surface,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  slideDescription: {
    fontSize: typography.fontSize.md,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    lineHeight: 24,
  },
  bottomContainer: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.xl,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surface,
    marginHorizontal: 4,
  },
  buttonContainer: {
    alignItems: 'center',
  },
  nextButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  getStartedButton: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.lg,
  },
  getStartedButtonText: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: typography.fontSize.lg,
  },
});
