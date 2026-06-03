import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ViewStyle } from 'react-native';
import { makeThemedStyles, useThemeColors, spacing, typography } from '../../theme';

interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  containerStyle?: ViewStyle;
  labelPosition?: 'left' | 'right';
}

export const Switch: React.FC<SwitchProps> = ({
  value,
  onValueChange,
  label,
  description,
  disabled = false,
  size = 'medium',
  containerStyle,
  labelPosition = 'left',
}) => {
  const styles = useStyles();
  const colors = useThemeColors();

  const animatedValue = React.useRef(new Animated.Value(value ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: value ? 1 : 0,
      useNativeDriver: false,
      friction: 5,
    }).start();
  }, [value, animatedValue]);

  const getTrackSize = () => {
    switch (size) {
      case 'small':
        return { width: 40, height: 22 };
      case 'large':
        return { width: 60, height: 34 };
      default:
        return { width: 50, height: 28 };
    }
  };

  const getThumbSize = () => {
    switch (size) {
      case 'small':
        return 18;
      case 'large':
        return 30;
      default:
        return 24;
    }
  };

  const trackSize = getTrackSize();
  const thumbSize = getThumbSize();
  const thumbOffset = (trackSize.height - thumbSize) / 2;

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [thumbOffset, trackSize.width - thumbSize - thumbOffset],
  });

  const trackBackgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, colors.primary],
  });

  const handlePress = () => {
    if (!disabled) {
      onValueChange(!value);
    }
  };

  const renderLabel = () => (
    <View style={styles.textContainer}>
      {label && <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>}
      {description && <Text style={styles.description}>{description}</Text>}
    </View>
  );

  return (
    <View style={[styles.container, containerStyle]}>
      <TouchableOpacity
        style={[styles.touchable, labelPosition === 'right' && styles.touchableReverse]}
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.7}
      >
        {label && labelPosition === 'left' && renderLabel()}

        <Animated.View
          style={[
            styles.track,
            {
              width: trackSize.width,
              height: trackSize.height,
              backgroundColor: trackBackgroundColor,
            },
            disabled && styles.trackDisabled,
          ]}
        >
          <Animated.View
            style={[
              styles.thumb,
              {
                width: thumbSize,
                height: thumbSize,
                transform: [{ translateX }],
              },
              disabled && styles.thumbDisabled,
            ]}
          />
        </Animated.View>

        {label && labelPosition === 'right' && renderLabel()}
      </TouchableOpacity>
    </View>
  );
};

const useStyles = makeThemedStyles((colors) =>
  StyleSheet.create({
    container: {
      marginBottom: spacing.sm,
    },
    touchable: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    touchableReverse: {
      flexDirection: 'row-reverse',
    },
    track: {
      borderRadius: 20,
      justifyContent: 'center',
    },
    trackDisabled: {
      opacity: 0.5,
    },
    thumb: {
      backgroundColor: colors.surface,
      borderRadius: 50,
      position: 'absolute',
      shadowColor: colors.text.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },
    thumbDisabled: {
      backgroundColor: colors.background,
    },
    textContainer: {
      flex: 1,
      marginHorizontal: spacing.md,
    },
    label: {
      fontSize: typography.fontSize.md,
      color: colors.text.primary,
      fontWeight: typography.fontWeight.medium,
    },
    labelDisabled: {
      color: colors.text.disabled,
    },
    description: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
      marginTop: spacing.xs,
    },
  })
);
