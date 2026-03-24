import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../../theme';
import { Button, Chip, Checkbox } from '../ui';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAX_TRANSLATE_Y = -SCREEN_HEIGHT * 0.8;

export interface FilterOptions {
  categories?: string[];
  priceRange?: { min: number; max: number };
  sizes?: string[];
  colors?: string[];
  inStock?: boolean;
  onSale?: boolean;
  sortBy?: string;
}

interface FilterBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  initialFilters?: FilterOptions;
  availableCategories?: { id: string; name: string }[];
  availableSizes?: string[];
  availableColors?: string[];
}

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'name_asc', label: 'Name: A to Z' },
  { value: 'name_desc', label: 'Name: Z to A' },
];

const priceRanges = [
  { min: 0, max: 2000, label: 'Under 2,000 DZD' },
  { min: 2000, max: 5000, label: '2,000 - 5,000 DZD' },
  { min: 5000, max: 10000, label: '5,000 - 10,000 DZD' },
  { min: 10000, max: 20000, label: '10,000 - 20,000 DZD' },
  { min: 20000, max: Infinity, label: 'Over 20,000 DZD' },
];

export const FilterBottomSheet: React.FC<FilterBottomSheetProps> = ({
  visible,
  onClose,
  onApply,
  initialFilters = {},
  availableCategories = [],
  availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  availableColors = ['Black', 'White', 'Blue', 'Red', 'Green', 'Yellow', 'Pink', 'Gray'],
}) => {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(0);

  const [filters, setFilters] = useState<FilterOptions>(initialFilters);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(MAX_TRANSLATE_Y, { damping: 50 });
    } else {
      translateY.value = withSpring(0, { damping: 50 });
    }
  }, [visible]);

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      translateY.value = Math.max(
        MAX_TRANSLATE_Y,
        Math.min(0, MAX_TRANSLATE_Y + event.translationY)
      );
    })
    .onEnd((event) => {
      if (event.translationY > 100 || event.velocityY > 500) {
        translateY.value = withSpring(0, { damping: 50 });
        runOnJS(onClose)();
      } else {
        translateY.value = withSpring(MAX_TRANSLATE_Y, { damping: 50 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleCategoryToggle = (categoryId: string) => {
    const current = filters.categories || [];
    const updated = current.includes(categoryId)
      ? current.filter((c) => c !== categoryId)
      : [...current, categoryId];
    setFilters({ ...filters, categories: updated });
  };

  const handleSizeToggle = (size: string) => {
    const current = filters.sizes || [];
    const updated = current.includes(size)
      ? current.filter((s) => s !== size)
      : [...current, size];
    setFilters({ ...filters, sizes: updated });
  };

  const handleColorToggle = (color: string) => {
    const current = filters.colors || [];
    const updated = current.includes(color)
      ? current.filter((c) => c !== color)
      : [...current, color];
    setFilters({ ...filters, colors: updated });
  };

  const handlePriceRange = (range: { min: number; max: number }) => {
    if (
      filters.priceRange?.min === range.min &&
      filters.priceRange?.max === range.max
    ) {
      setFilters({ ...filters, priceRange: undefined });
    } else {
      setFilters({ ...filters, priceRange: range });
    }
  };

  const handleReset = () => {
    setFilters({});
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const activeFiltersCount =
    (filters.categories?.length || 0) +
    (filters.sizes?.length || 0) +
    (filters.colors?.length || 0) +
    (filters.priceRange ? 1 : 0) +
    (filters.inStock ? 1 : 0) +
    (filters.onSale ? 1 : 0);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <GestureDetector gesture={gesture}>
          <Animated.View style={[styles.container, animatedStyle]}>
            {/* Handle */}
            <View style={styles.handle} />

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Filters</Text>
              {activeFiltersCount > 0 && (
                <TouchableOpacity onPress={handleReset}>
                  <Text style={styles.resetText}>Reset All</Text>
                </TouchableOpacity>
              )}
            </View>

            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
            >
              {/* Sort By */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Sort By</Text>
                <View style={styles.chipContainer}>
                  {sortOptions.map((option) => (
                    <Chip
                      key={option.value}
                      label={option.label}
                      selected={filters.sortBy === option.value}
                      onPress={() =>
                        setFilters({
                          ...filters,
                          sortBy:
                            filters.sortBy === option.value
                              ? undefined
                              : option.value,
                        })
                      }
                    />
                  ))}
                </View>
              </View>

              {/* Categories */}
              {availableCategories.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Categories</Text>
                  <View style={styles.chipContainer}>
                    {availableCategories.map((category) => (
                      <Chip
                        key={category.id}
                        label={category.name}
                        selected={filters.categories?.includes(category.id)}
                        onPress={() => handleCategoryToggle(category.id)}
                      />
                    ))}
                  </View>
                </View>
              )}

              {/* Price Range */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Price Range</Text>
                <View style={styles.chipContainer}>
                  {priceRanges.map((range, index) => (
                    <Chip
                      key={index}
                      label={range.label}
                      selected={
                        filters.priceRange?.min === range.min &&
                        filters.priceRange?.max === range.max
                      }
                      onPress={() => handlePriceRange(range)}
                    />
                  ))}
                </View>
              </View>

              {/* Sizes */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Size</Text>
                <View style={styles.chipContainer}>
                  {availableSizes.map((size) => (
                    <Chip
                      key={size}
                      label={size}
                      selected={filters.sizes?.includes(size)}
                      onPress={() => handleSizeToggle(size)}
                    />
                  ))}
                </View>
              </View>

              {/* Colors */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Color</Text>
                <View style={styles.chipContainer}>
                  {availableColors.map((color) => (
                    <Chip
                      key={color}
                      label={color}
                      selected={filters.colors?.includes(color)}
                      onPress={() => handleColorToggle(color)}
                    />
                  ))}
                </View>
              </View>

              {/* Additional Filters */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Other</Text>
                <Checkbox
                  checked={filters.inStock || false}
                  onChange={(checked) =>
                    setFilters({ ...filters, inStock: checked })
                  }
                  label="In Stock Only"
                />
                <Checkbox
                  checked={filters.onSale || false}
                  onChange={(checked) =>
                    setFilters({ ...filters, onSale: checked })
                  }
                  label="On Sale"
                />
              </View>
            </ScrollView>

            {/* Footer */}
            <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
              <Button
                title={`Apply Filters${activeFiltersCount > 0 ? ` (${activeFiltersCount})` : ''}`}
                onPress={handleApply}
                fullWidth
              />
            </View>
          </Animated.View>
        </GestureDetector>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  container: {
    position: 'absolute',
    top: SCREEN_HEIGHT,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.85,
    backgroundColor: colors.surface,
    borderTopLeftRadius: spacing.borderRadius.xl,
    borderTopRightRadius: spacing.borderRadius.xl,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  resetText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
});
