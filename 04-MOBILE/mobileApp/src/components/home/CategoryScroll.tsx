import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme';

export interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  productCount?: number;
}

interface CategoryScrollProps {
  categories: Category[];
  title?: string;
  showSeeAll?: boolean;
  onSeeAll?: () => void;
}

export const CategoryScroll: React.FC<CategoryScrollProps> = ({
  categories,
  title,
  showSeeAll = false,
  onSeeAll,
}) => {
  const router = useRouter();

  const handleCategoryPress = (category: Category) => {
    router.push(`/products?category=${encodeURIComponent(category.slug)}`);
  };

  return (
    <View style={styles.container}>
      {title && (
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {showSeeAll && onSeeAll && (
            <TouchableOpacity onPress={onSeeAll}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={styles.categoryItem}
            onPress={() => handleCategoryPress(category)}
            activeOpacity={0.7}
          >
            <View style={styles.categoryImageContainer}>
              {category.imageUrl ? (
                <Image
                  source={{ uri: category.imageUrl }}
                  style={styles.categoryImage}
                  resizeMode="cover"
                />
              ) : category.icon ? (
                <Ionicons name={category.icon} size={28} color={colors.primary} />
              ) : (
                <Ionicons name="grid-outline" size={28} color={colors.primary} />
              )}
            </View>
            <Text style={styles.categoryName} numberOfLines={1}>
              {category.name}
            </Text>
            {category.productCount !== undefined && (
              <Text style={styles.productCount}>
                {category.productCount} items
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

// Grid variant for category display
interface CategoryGridProps {
  categories: Category[];
  columns?: number;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories,
  columns = 4,
}) => {
  const router = useRouter();

  const handleCategoryPress = (category: Category) => {
    router.push(`/products?category=${encodeURIComponent(category.slug)}`);
  };

  return (
    <View style={styles.gridContainer}>
      {categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={[styles.gridItem, { width: `${100 / columns - 2}%` }]}
          onPress={() => handleCategoryPress(category)}
          activeOpacity={0.7}
        >
          <View style={styles.gridImageContainer}>
            {category.imageUrl ? (
              <Image
                source={{ uri: category.imageUrl }}
                style={styles.gridImage}
                resizeMode="cover"
              />
            ) : category.icon ? (
              <Ionicons name={category.icon} size={32} color={colors.primary} />
            ) : (
              <Ionicons name="grid-outline" size={32} color={colors.primary} />
            )}
          </View>
          <Text style={styles.gridCategoryName} numberOfLines={2}>
            {category.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  seeAll: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  categoryItem: {
    alignItems: 'center',
    width: 80,
  },
  categoryImageContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.secondaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
    overflow: 'hidden',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  categoryName: {
    fontSize: typography.fontSize.xs,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
    textAlign: 'center',
  },
  productCount: {
    fontSize: 10,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  // Grid styles
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  gridItem: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  gridImageContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.secondaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
    overflow: 'hidden',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridCategoryName: {
    fontSize: 11,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
    textAlign: 'center',
    maxWidth: 70,
  },
});
