import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Chip } from '../ui';
import { CategoryResponse } from '../../graphql/generated/graphql';
import { useTranslation } from 'react-i18next';
import { spacing } from '../../theme';

export type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'popular';

interface FilterBarProps {
  categories?: CategoryResponse[];
  selectedCategory?: number | null;
  onCategoryChange?: (categoryId: number | null) => void;
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

  const getCategoryName = (category: CategoryResponse) => {
    switch (i18n.language) {
      case 'ar':
        return category.nameAr || category.nameFr || category.nameEn || '';
      case 'en':
        return category.nameEn || category.nameFr || category.nameAr || '';
      default:
        return category.nameFr || category.nameEn || category.nameAr || '';
    }
  };

  const handleCategoryPress = (categoryId: number | null) => {
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
      {showCategories && categories.length > 0 && (
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
          {categories.map((category) => (
            <Chip
              key={category.id}
              label={getCategoryName(category)}
              selected={selectedCategory === category.id}
              onPress={() => handleCategoryPress(category.id!)}
              style={styles.chip}
            />
          ))}
        </ScrollView>
      )}
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
