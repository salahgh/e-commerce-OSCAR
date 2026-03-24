import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ViewStyle,
} from 'react-native';
import { colors, spacing, typography } from '../../theme';

export interface Variant {
  id: string;
  name: string;
  value: string;
  price?: number;
  stock?: number;
  imageUrl?: string;
  disabled?: boolean;
}

export interface VariantGroup {
  name: string;
  type: 'color' | 'size' | 'text' | 'image';
  variants: Variant[];
}

interface VariantPickerProps {
  group: VariantGroup;
  selectedVariantId?: string;
  onSelect: (variant: Variant) => void;
  containerStyle?: ViewStyle;
  showStock?: boolean;
  showPrice?: boolean;
}

export const VariantPicker: React.FC<VariantPickerProps> = ({
  group,
  selectedVariantId,
  onSelect,
  containerStyle,
  showStock = false,
  showPrice = false,
}) => {
  const renderColorVariant = (variant: Variant) => {
    const isSelected = selectedVariantId === variant.id;
    const isDisabled = variant.disabled || (variant.stock !== undefined && variant.stock <= 0);

    return (
      <TouchableOpacity
        key={variant.id}
        style={[
          styles.colorVariant,
          isSelected && styles.colorVariantSelected,
          isDisabled && styles.variantDisabled,
        ]}
        onPress={() => !isDisabled && onSelect(variant)}
        disabled={isDisabled}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.colorCircle,
            { backgroundColor: variant.value },
            isSelected && styles.colorCircleSelected,
          ]}
        />
        {isDisabled && <View style={styles.crossLine} />}
      </TouchableOpacity>
    );
  };

  const renderSizeVariant = (variant: Variant) => {
    const isSelected = selectedVariantId === variant.id;
    const isDisabled = variant.disabled || (variant.stock !== undefined && variant.stock <= 0);

    return (
      <TouchableOpacity
        key={variant.id}
        style={[
          styles.sizeVariant,
          isSelected && styles.sizeVariantSelected,
          isDisabled && styles.variantDisabled,
        ]}
        onPress={() => !isDisabled && onSelect(variant)}
        disabled={isDisabled}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.sizeText,
            isSelected && styles.sizeTextSelected,
            isDisabled && styles.textDisabled,
          ]}
        >
          {variant.value}
        </Text>
        {showStock && variant.stock !== undefined && variant.stock > 0 && variant.stock <= 5 && (
          <Text style={styles.stockWarning}>{variant.stock} left</Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderTextVariant = (variant: Variant) => {
    const isSelected = selectedVariantId === variant.id;
    const isDisabled = variant.disabled || (variant.stock !== undefined && variant.stock <= 0);

    return (
      <TouchableOpacity
        key={variant.id}
        style={[
          styles.textVariant,
          isSelected && styles.textVariantSelected,
          isDisabled && styles.variantDisabled,
        ]}
        onPress={() => !isDisabled && onSelect(variant)}
        disabled={isDisabled}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.textVariantLabel,
            isSelected && styles.textVariantLabelSelected,
            isDisabled && styles.textDisabled,
          ]}
        >
          {variant.name}
        </Text>
        {showPrice && variant.price !== undefined && (
          <Text
            style={[
              styles.variantPrice,
              isSelected && styles.variantPriceSelected,
            ]}
          >
            {variant.price.toFixed(2)} DZD
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderImageVariant = (variant: Variant) => {
    const isSelected = selectedVariantId === variant.id;
    const isDisabled = variant.disabled || (variant.stock !== undefined && variant.stock <= 0);

    return (
      <TouchableOpacity
        key={variant.id}
        style={[
          styles.imageVariant,
          isSelected && styles.imageVariantSelected,
          isDisabled && styles.variantDisabled,
        ]}
        onPress={() => !isDisabled && onSelect(variant)}
        disabled={isDisabled}
        activeOpacity={0.7}
      >
        {variant.imageUrl ? (
          <Image
            source={{ uri: variant.imageUrl }}
            style={styles.variantImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>{variant.value}</Text>
          </View>
        )}
        {isDisabled && <View style={styles.imageOverlay} />}
      </TouchableOpacity>
    );
  };

  // Import Image for image variant
  const { Image } = require('react-native');

  const renderVariant = (variant: Variant) => {
    switch (group.type) {
      case 'color':
        return renderColorVariant(variant);
      case 'size':
        return renderSizeVariant(variant);
      case 'image':
        return renderImageVariant(variant);
      default:
        return renderTextVariant(variant);
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.groupName}>{group.name}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.variantsContainer}
      >
        {group.variants.map(renderVariant)}
      </ScrollView>
    </View>
  );
};

// Multi-Variant Picker for multiple variant groups
interface MultiVariantPickerProps {
  groups: VariantGroup[];
  selectedVariants: Record<string, string>;
  onSelectVariant: (groupName: string, variant: Variant) => void;
  containerStyle?: ViewStyle;
  showStock?: boolean;
  showPrice?: boolean;
}

export const MultiVariantPicker: React.FC<MultiVariantPickerProps> = ({
  groups,
  selectedVariants,
  onSelectVariant,
  containerStyle,
  showStock = false,
  showPrice = false,
}) => {
  return (
    <View style={containerStyle}>
      {groups.map((group) => (
        <VariantPicker
          key={group.name}
          group={group}
          selectedVariantId={selectedVariants[group.name]}
          onSelect={(variant) => onSelectVariant(group.name, variant)}
          showStock={showStock}
          showPrice={showPrice}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  groupName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  variantsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },

  // Color variant styles
  colorVariant: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: colors.transparent,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 2,
  },
  colorVariantSelected: {
    borderColor: colors.primary,
  },
  colorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  colorCircleSelected: {
    borderWidth: 0,
  },
  crossLine: {
    position: 'absolute',
    width: 40,
    height: 2,
    backgroundColor: colors.error,
    transform: [{ rotate: '45deg' }],
  },

  // Size variant styles
  sizeVariant: {
    minWidth: 48,
    height: 44,
    borderRadius: spacing.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
  },
  sizeVariantSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  sizeText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  sizeTextSelected: {
    color: colors.text.inverse,
  },
  stockWarning: {
    fontSize: typography.fontSize.xs,
    color: colors.warning,
    marginTop: 2,
  },

  // Text variant styles
  textVariant: {
    borderRadius: spacing.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  textVariantSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.secondaryLight,
  },
  textVariantLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  textVariantLabelSelected: {
    color: colors.primary,
  },
  variantPrice: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  variantPriceSelected: {
    color: colors.primary,
  },

  // Image variant styles
  imageVariant: {
    width: 64,
    height: 64,
    borderRadius: spacing.borderRadius.md,
    borderWidth: 2,
    borderColor: colors.transparent,
    overflow: 'hidden',
  },
  imageVariantSelected: {
    borderColor: colors.primary,
  },
  variantImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },

  // Disabled styles
  variantDisabled: {
    opacity: 0.5,
  },
  textDisabled: {
    color: colors.text.disabled,
  },
});
