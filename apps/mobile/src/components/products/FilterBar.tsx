import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Chip } from '../ui';
import { useTranslation } from 'react-i18next';
import { spacing } from '../../theme';

export type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'popular';

interface FilterCategory {
  id: string;
  name: string;
  slug?: string;
}

interface FilterBarProps {
  categories?: FilterCategory[];
  selectedCategory?: string | null;
  onCategoryChange?: (categoryId: string | null) => void;
  sortBy?: SortOption;
  onSortChange?: (sort: SortOption) => void;
  showSort?: boolean;
  showCategories?: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  categories = [],
  selectedCategory = null,
  onCategoryChange,
  sortBy = 'newest',
  onSortChange,
  showSort = true,
  showCategories = true,
}) => {
  const { t, i18n } = useTranslation();

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'newest', label: t('products.sort.newest', 'Newest') },
    { value: 'popular', label: t('products.sort.popular', 'Popular') },
    { value: 'price_asc', label: t('products.sort.priceAsc', 'Price: Low to High') },
    { value: 'price_desc', label: t('products.sort.priceDesc', 'Price: High to Low') },
  ];

  const getCategoryName = (category: FilterCategory) => {
    return category.name || '';
  };

  const handleCategoryPress = (categoryId: string | null) => {
    if (onCategoryChange) {
      onCategoryChange(categoryId === selectedCategory ? null : categoryId);
    }
  };

  const handleSortPress = (sort: SortOption) => {
    if (onSortChange) {
      onSortChange(sort);
    }
  };

  if (!showSort && !showCategories) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Sort Options */}
      {showSort && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {sortOptions.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              selected={sortBy === option.value}
              onPress={() => handleSortPress(option.value)}
              style={styles.chip}
            />
          ))}
        </ScrollView>
      )}

      {/* Category Filters */}
      {showCategories && categories.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* All Categories */}
          <Chip
            label={t('products.allCategories', 'All')}
            selected={selectedCategory === null}
            onPress={() => handleCategoryPress(null)}
            style={styles.chip}
          />

          {/* Individual Categories */}
          {categories.map((category) => {
            const key = category.slug || category.id;
            return (
              <Chip
                key={category.id}
                label={getCategoryName(category)}
                selected={selectedCategory === key}
                onPress={() => handleCategoryPress(key)}
                style={styles.chip}
              />
            );
          })}
        </ScrollView>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  chip: {
    marginRight: 0,
  },
});
