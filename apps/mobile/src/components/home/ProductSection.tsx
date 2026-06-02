import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ProductCard, SimpleProduct } from '../products/ProductCard';
import { colors, spacing, typography } from '../../theme';

interface ProductSectionProps {
  title: string;
  products: SimpleProduct[];
  onSeeAll?: () => void;
  showSeeAll?: boolean;
  variant?: 'horizontal' | 'grid';
  loading?: boolean;
}

export const ProductSection: React.FC<ProductSectionProps> = ({
  title,
  products,
  onSeeAll,
  showSeeAll = true,
  variant = 'horizontal',
  loading = false,
}) => {
  const router = useRouter();

  if (products.length === 0 && !loading) return null;

  const renderHorizontalItem = ({ item }: { item: SimpleProduct }) => (
    <View style={styles.horizontalCard}>
      <ProductCard product={item} />
    </View>
  );

  const renderGridItem = ({ item, index }: { item: SimpleProduct; index: number }) => (
    <View style={[styles.gridCard, index % 2 === 1 && styles.gridCardRight]}>
      <ProductCard product={item} />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {showSeeAll && onSeeAll && (
          <TouchableOpacity onPress={onSeeAll} activeOpacity={0.7}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Products */}
      {variant === 'horizontal' ? (
        <FlatList
          data={products}
          renderItem={renderHorizontalItem}
          keyExtractor={(item) => item.id?.toString() || ''}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        />
      ) : (
        <FlatList
          data={products}
          renderItem={renderGridItem}
          keyExtractor={(item) => item.id?.toString() || ''}
          numColumns={2}
          scrollEnabled={false}
          contentContainerStyle={styles.gridList}
        />
      )}
    </View>
  );
};

// Compact product card for featured sections
interface CompactProductCardProps {
  product: SimpleProduct;
  onPress?: () => void;
}

export const CompactProductCard: React.FC<CompactProductCardProps> = ({
  product,
  onPress,
}) => {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/products/${product.slug}`);
    }
  };

  const imageUrl = product.imageUrl;

  return (
    <TouchableOpacity
      style={styles.compactCard}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {imageUrl && (
        <View style={styles.compactImageContainer}>
          <Image source={{ uri: imageUrl }} style={styles.compactImage} resizeMode="cover" />
        </View>
      )}
      <View style={styles.compactInfo}>
        <Text style={styles.compactName} numberOfLines={1}>
          {product.name}
        </Text>
        <Text style={styles.compactPrice}>{product.price} DZD</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
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
  horizontalList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  horizontalCard: {
    width: 160,
  },
  gridList: {
    paddingHorizontal: spacing.lg,
  },
  gridCard: {
    flex: 1,
    marginRight: spacing.sm,
    marginBottom: spacing.md,
  },
  gridCardRight: {
    marginRight: 0,
    marginLeft: spacing.sm,
  },
  // Compact card styles
  compactCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.md,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  compactImageContainer: {
    width: 80,
    height: 80,
  },
  compactImage: {
    width: '100%',
    height: '100%',
  },
  compactInfo: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'center',
  },
  compactName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  compactPrice: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
});
