import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useSegments } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme';
import { CartBadge } from '../cart/CartBadge';

interface CustomHeaderProps {
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  showCartBadge?: boolean;
  showSearch?: boolean;
  onSearchPress?: () => void;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  transparent?: boolean;
  containerStyle?: ViewStyle;
  titleComponent?: React.ReactNode;
  centerTitle?: boolean;
}

export const CustomHeader: React.FC<CustomHeaderProps> = ({
  title,
  subtitle,
  showBackButton = true,
  showCartBadge = false,
  showSearch = false,
  onSearchPress,
  leftIcon,
  rightIcon,
  onLeftPress,
  onRightPress,
  transparent = false,
  containerStyle,
  titleComponent,
  centerTitle = false,
}) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const segments = useSegments();

  // Check if we can go back
  const canGoBack = segments.length > 1;

  const handleBackPress = () => {
    if (onLeftPress) {
      onLeftPress();
    } else if (canGoBack) {
      router.back();
    }
  };

  const renderLeftContent = () => {
    if (leftIcon) {
      return (
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onLeftPress}
          activeOpacity={0.7}
        >
          {leftIcon}
        </TouchableOpacity>
      );
    }

    if (showBackButton && canGoBack) {
      return (
        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleBackPress}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={transparent ? colors.text.inverse : colors.text.primary}
          />
        </TouchableOpacity>
      );
    }

    return <View style={styles.placeholder} />;
  };

  const renderRightContent = () => {
    const rightItems: React.ReactNode[] = [];

    if (showSearch) {
      rightItems.push(
        <TouchableOpacity
          key="search"
          style={styles.iconButton}
          onPress={onSearchPress}
          activeOpacity={0.7}
        >
          <Ionicons
            name="search-outline"
            size={24}
            color={transparent ? colors.text.inverse : colors.text.primary}
          />
        </TouchableOpacity>
      );
    }

    if (showCartBadge) {
      rightItems.push(
        <View key="cart" style={styles.iconButton}>
          <CartBadge
            size="medium"
            color={transparent ? colors.text.inverse : colors.text.primary}
          />
        </View>
      );
    }

    if (rightIcon) {
      rightItems.push(
        <TouchableOpacity
          key="rightIcon"
          style={styles.iconButton}
          onPress={onRightPress}
          activeOpacity={0.7}
        >
          {rightIcon}
        </TouchableOpacity>
      );
    }

    if (rightItems.length === 0) {
      return <View style={styles.placeholder} />;
    }

    return <View style={styles.rightContainer}>{rightItems}</View>;
  };

  const renderTitle = () => {
    if (titleComponent) {
      return titleComponent;
    }

    return (
      <View style={[styles.titleContainer, centerTitle && styles.titleCentered]}>
        {title && (
          <Text
            style={[
              styles.title,
              transparent && styles.titleTransparent,
            ]}
            numberOfLines={1}
          >
            {title}
          </Text>
        )}
        {subtitle && (
          <Text
            style={[
              styles.subtitle,
              transparent && styles.subtitleTransparent,
            ]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        )}
      </View>
    );
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top },
        !transparent && styles.containerSolid,
        containerStyle,
      ]}
    >
      <StatusBar
        barStyle={transparent ? 'light-content' : 'dark-content'}
        backgroundColor={transparent ? 'transparent' : colors.surface}
        translucent={transparent}
      />
      <View style={styles.content}>
        {renderLeftContent()}
        {renderTitle()}
        {renderRightContent()}
      </View>
    </View>
  );
};

// Simple header with just back button and title
interface SimpleHeaderProps {
  title: string;
  onBackPress?: () => void;
}

export const SimpleHeader: React.FC<SimpleHeaderProps> = ({ title, onBackPress }) => {
  return (
    <CustomHeader
      title={title}
      showBackButton
      onLeftPress={onBackPress}
      centerTitle
    />
  );
};

// Shop header with logo, search, and cart
interface ShopHeaderProps {
  onSearchPress?: () => void;
  showSearch?: boolean;
}

export const ShopHeader: React.FC<ShopHeaderProps> = ({
  onSearchPress,
  showSearch = true,
}) => {
  return (
    <CustomHeader
      titleComponent={
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>OSCAR</Text>
          <Text style={styles.logoSubtext}>FASHION</Text>
        </View>
      }
      showBackButton={false}
      showCartBadge
      showSearch={showSearch}
      onSearchPress={onSearchPress}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    zIndex: 100,
  },
  containerSolid: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  content: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: 40,
  },
  titleContainer: {
    flex: 1,
    paddingHorizontal: spacing.sm,
  },
  titleCentered: {
    alignItems: 'center',
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.text.primary,
  },
  titleTransparent: {
    color: colors.text.inverse,
  },
  subtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginTop: 2,
  },
  subtitleTransparent: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    letterSpacing: 4,
  },
  logoSubtext: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    letterSpacing: 6,
    marginTop: -2,
  },
});
