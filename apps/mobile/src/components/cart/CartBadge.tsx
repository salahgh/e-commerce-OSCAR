import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing, typography } from '../../theme';
import { useCart } from '../../contexts/CartContext';

interface CartBadgeProps {
  size?: 'small' | 'medium' | 'large';
  showZero?: boolean;
  onPress?: () => void;
  color?: string;
  badgeColor?: string;
}

export const CartBadge: React.FC<CartBadgeProps> = ({
  size = 'medium',
  showZero = false,
  onPress,
  color = colors.text.primary,
  badgeColor = colors.error,
}) => {
  const router = useRouter();
  const { itemCount } = useCart();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const prevCount = React.useRef(itemCount);

  // Animate badge when count changes
  React.useEffect(() => {
    if (itemCount !== prevCount.current) {
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.3,
          useNativeDriver: true,
          friction: 3,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          friction: 3,
        }),
      ]).start();
      prevCount.current = itemCount;
    }
  }, [itemCount, scaleAnim]);

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push('/cart');
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 20;
      case 'large':
        return 32;
      default:
        return 26;
    }
  };

  const getBadgeSize = () => {
    switch (size) {
      case 'small':
        return { width: 16, height: 16, fontSize: 10 };
      case 'large':
        return { width: 24, height: 24, fontSize: 14 };
      default:
        return { width: 20, height: 20, fontSize: 12 };
    }
  };

  const iconSize = getIconSize();
  const badgeSize = getBadgeSize();
  const displayCount = itemCount > 99 ? '99+' : itemCount.toString();
  const showBadge = itemCount > 0 || showZero;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Ionicons name="cart-outline" size={iconSize} color={color} />
      {showBadge && (
        <Animated.View
          style={[
            styles.badge,
            {
              width: badgeSize.width,
              height: badgeSize.height,
              backgroundColor: badgeColor,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Text style={[styles.badgeText, { fontSize: badgeSize.fontSize }]}>
            {displayCount}
          </Text>
        </Animated.View>
      )}
    </TouchableOpacity>
  );
};

// Mini Cart Badge for tab bar
interface TabCartBadgeProps {
  color?: string;
  focused?: boolean;
}

export const TabCartBadge: React.FC<TabCartBadgeProps> = ({
  color,
  focused,
}) => {
  const { itemCount } = useCart();

  return (
    <View style={styles.tabContainer}>
      <Ionicons
        name={focused ? 'cart' : 'cart-outline'}
        size={24}
        color={color}
      />
      {itemCount > 0 ? (
        <View style={styles.tabBadge}>
          <Text style={styles.tabBadgeText}>
            {itemCount > 99 ? '99+' : itemCount}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 20,
    paddingHorizontal: 4,
  },
  badgeText: {
    color: colors.text.inverse,
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
  },
  tabContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBadge: {
    position: 'absolute',
    top: -4,
    right: -12,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  tabBadgeText: {
    color: colors.text.inverse,
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
  },
});
