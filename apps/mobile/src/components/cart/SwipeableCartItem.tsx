import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { CartItemResponse } from '../../graphql/generated/graphql';
import { colors, spacing, typography } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DELETE_BUTTON_WIDTH = 80;

interface SwipeableCartItemProps {
  item: CartItemResponse;
  onUpdateQuantity: (itemId: number, quantity: number) => void;
  onRemove: (itemId: number) => void;
  loading?: boolean;
}

export const SwipeableCartItem: React.FC<SwipeableCartItemProps> = ({
  item,
  onUpdateQuantity,
  onRemove,
  loading = false,
}) => {
  const swipeableRef = useRef<Swipeable>(null);

  const handleProductPress = () => {
    if (item.productId) {
      router.push(`/products/${item.productId}`);
    }
  };

  const incrementQuantity = () => {
    if (item.id) {
      onUpdateQuantity(item.id, (item.quantity || 0) + 1);
    }
  };

  const decrementQuantity = () => {
    if (item.id && (item.quantity || 0) > 1) {
      onUpdateQuantity(item.id, (item.quantity || 0) - 1);
    }
  };

  const handleRemove = () => {
    swipeableRef.current?.close();
    if (item.id) {
      onRemove(item.id);
    }
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const translateX = dragX.interpolate({
      inputRange: [-DELETE_BUTTON_WIDTH, 0],
      outputRange: [0, DELETE_BUTTON_WIDTH],
      extrapolate: 'clamp',
    });

    const scale = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.8, 1],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        style={[
          styles.deleteContainer,
          {
            transform: [{ translateX }, { scale }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleRemove}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={24} color={colors.text.inverse} />
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      rightThreshold={40}
      overshootRight={false}
      friction={2}
    >
      <View style={styles.container}>
        <TouchableOpacity style={styles.imageContainer} onPress={handleProductPress}>
          {item.productImage ? (
            <Image
              source={{ uri: item.productImage }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="image-outline" size={32} color={colors.text.tertiary} />
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.details}>
          <TouchableOpacity onPress={handleProductPress}>
            <Text style={styles.productName} numberOfLines={2}>
              {item.productName}
            </Text>
          </TouchableOpacity>

          {/* Size and Color */}
          {(item.selectedSize || item.selectedColor) && (
            <View style={styles.attributes}>
              {item.selectedSize && (
                <Text style={styles.attribute}>Size: {item.selectedSize}</Text>
              )}
              {item.selectedColor && (
                <Text style={styles.attribute}>Color: {item.selectedColor}</Text>
              )}
            </View>
          )}

          {/* Price */}
          <Text style={styles.price}>{item.price?.toFixed(2)} DZD</Text>

          {/* Quantity Controls */}
          <View style={styles.quantityRow}>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                onPress={decrementQuantity}
                style={[
                  styles.quantityButton,
                  (item.quantity || 0) <= 1 && styles.quantityButtonDisabled,
                ]}
                disabled={loading || (item.quantity || 0) <= 1}
              >
                <Ionicons
                  name="remove"
                  size={16}
                  color={(item.quantity || 0) <= 1 ? colors.text.tertiary : colors.primary}
                />
              </TouchableOpacity>

              <Text style={styles.quantity}>{item.quantity}</Text>

              <TouchableOpacity
                onPress={incrementQuantity}
                style={styles.quantityButton}
                disabled={loading}
              >
                <Ionicons name="add" size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>

            {/* Subtotal */}
            <Text style={styles.subtotal}>{item.subtotal?.toFixed(2)} DZD</Text>
          </View>
        </View>

        {/* Swipe Hint */}
        <View style={styles.swipeHint}>
          <Ionicons name="chevron-back" size={16} color={colors.text.tertiary} />
        </View>
      </View>
    </Swipeable>
  );
};

// Wrapper component that provides GestureHandlerRootView
export const SwipeableCartItemWrapper: React.FC<SwipeableCartItemProps> = (props) => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SwipeableCartItem {...props} />
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: spacing.md,
    elevation: 1,
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: spacing.md,
  },
  image: {
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
  details: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    ...typography.styles.body,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  attributes: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  attribute: {
    ...typography.styles.caption,
    color: colors.text.secondary,
  },
  price: {
    ...typography.styles.body,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  quantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  quantity: {
    ...typography.styles.body,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    minWidth: 24,
    textAlign: 'center',
  },
  subtotal: {
    ...typography.styles.body,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  swipeHint: {
    justifyContent: 'center',
    paddingLeft: spacing.xs,
  },
  deleteContainer: {
    width: DELETE_BUTTON_WIDTH,
    marginBottom: spacing.md,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  deleteText: {
    color: colors.text.inverse,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    marginTop: spacing.xs,
  },
});
