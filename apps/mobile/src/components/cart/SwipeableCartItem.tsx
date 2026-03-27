import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { CartItemData } from './CartItem';
import { CartItemContent, cartItemStyles } from './CartItemContent';
import { colors, spacing, typography } from '../../theme';

const DELETE_BUTTON_WIDTH = 80;

interface SwipeableCartItemProps {
  item: CartItemData;
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
      <View style={cartItemStyles.container}>
        <CartItemContent
          item={item}
          onUpdateQuantity={onUpdateQuantity}
          loading={loading}
        />

        <View style={styles.swipeHint}>
          <Ionicons name="chevron-back" size={16} color={colors.text.tertiary} />
        </View>
      </View>
    </Swipeable>
  );
};

export const SwipeableCartItemWrapper: React.FC<SwipeableCartItemProps> = (props) => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SwipeableCartItem {...props} />
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
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
