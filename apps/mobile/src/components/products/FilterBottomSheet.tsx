import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
import { spacing, typography, makeThemedStyles } from '../../theme';
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

/** Real Vendure facet value with usage count, supplied by SearchProductsQuery. */
export interface ColorFacetOption {
  label: string;
  count: number;
}

interface FilterBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  initialFilters?: FilterOptions;
  availableCategories?: { id: string; name: string }[];
  availableSizes?: string[];
  availableColors?: string[];
  /**
   * Optional: real color facet values (label + count) pulled from the
   * SearchProductsQuery response. When provided, overrides `availableColors`
   * and shows counts next to each chip. Selection still travels through
   * `filters.colors` (by label) so existing callers keep working.
   */
  colorFacets?: ColorFacetOption[];
}

const groupNum = (n: number) => n.toLocaleString('en-US');

export const FilterBottomSheet: React.FC<FilterBottomSheetProps> = ({
  visible,
  onClose,
  onApply,
  initialFilters = {},
  availableCategories = [],
  availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  availableColors = ['Black', 'White', 'Blue', 'Red', 'Green', 'Yellow', 'Pink', 'Gray'],
  colorFacets,
}) => {
  /**
   * Render either real Vendure facet values (label + count) when present,
   * or the static fallback. Keeps selection in `filters.colors` for
   * backward compatibility.
   */
  const colorEntries: ColorFacetOption[] =
    colorFacets && colorFacets.length > 0
      ? colorFacets
      : availableColors.map((label) => ({ label, count: 0 }));
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(0);
  const styles = useStyles();
  const { t } = useTranslation();

  const sortOptions = [
    { value: 'newest', label: t('filters.sortNewest') },
    { value: 'oldest', label: t('filters.sortOldest') },
    { value: 'price_low', label: t('filters.priceLowHigh') },
    { value: 'price_high', label: t('filters.priceHighLow') },
    { value: 'name_asc', label: t('filters.sortNameAsc') },
    { value: 'name_desc', label: t('filters.sortNameDesc') },
  ];

  const priceRanges = [
    { min: 0, max: 2000, label: t('filters.priceUnder', { max: groupNum(2000) }) },
    { min: 2000, max: 5000, label: t('filters.priceBetween', { min: groupNum(2000), max: groupNum(5000) }) },
    { min: 5000, max: 10000, label: t('filters.priceBetween', { min: groupNum(5000), max: groupNum(10000) }) },
    { min: 10000, max: 20000, label: t('filters.priceBetween', { min: groupNum(10000), max: groupNum(20000) }) },
    { min: 20000, max: Infinity, label: t('filters.priceOver', { min: groupNum(20000) }) },
  ];

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
    const updated = current.includes(size) ? current.filter((s) => s !== size) : [...current, size];
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
    if (filters.priceRange?.min === range.min && filters.priceRange?.max === range.max) {
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
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <GestureDetector gesture={gesture}>
          <Animated.View style={[styles.container, animatedStyle]}>
            {/* Handle */}
            <View style={styles.handle} />

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>{t('filters.title')}</Text>
              {activeFiltersCount > 0 ? (
                <TouchableOpacity onPress={handleReset}>
                  <Text style={styles.resetText}>{t('common.clearAll')}</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
            >
              {/* Sort By */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('filters.sortBy')}</Text>
                <View style={styles.chipContainer}>
                  {sortOptions.map((option) => (
                    <Chip
                      key={option.value}
                      label={option.label}
                      selected={filters.sortBy === option.value}
                      onPress={() =>
                        setFilters({
                          ...filters,
                          sortBy: filters.sortBy === option.value ? undefined : option.value,
                        })
                      }
                    />
                  ))}
                </View>
              </View>

              {/* Categories */}
              {availableCategories.length > 0 ? (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>{t('filters.categories')}</Text>
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
              ) : null}

              {/* Price Range */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('filters.priceRange')}</Text>
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
                <Text style={styles.sectionTitle}>{t('products.size')}</Text>
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
                <Text style={styles.sectionTitle}>{t('products.color')}</Text>
                <View style={styles.chipContainer}>
                  {colorEntries.map((c) => (
                    <Chip
                      key={c.label}
                      label={c.count > 0 ? `${c.label} (${c.count})` : c.label}
                      selected={filters.colors?.includes(c.label)}
                      onPress={() => handleColorToggle(c.label)}
                    />
                  ))}
                </View>
              </View>

              {/* Additional Filters */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('filters.other')}</Text>
                <Checkbox
                  checked={filters.inStock || false}
                  onChange={(checked) => setFilters({ ...filters, inStock: checked })}
                  label={t('filters.inStockOnly')}
                />
                <Checkbox
                  checked={filters.onSale || false}
                  onChange={(checked) => setFilters({ ...filters, onSale: checked })}
                  label={t('filters.onSale')}
                />
              </View>
            </ScrollView>

            {/* Footer */}
            <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
              <Button
                title={
                  activeFiltersCount > 0
                    ? t('filters.applyWithCount', { count: activeFiltersCount })
                    : t('filters.apply')
                }
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

const useStyles = makeThemedStyles((colors) =>
  StyleSheet.create({
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
  })
);
