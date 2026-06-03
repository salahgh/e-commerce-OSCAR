import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { makeThemedStyles, useThemeColors, spacing, typography } from '../../theme';
import { haptics } from '../../utils/haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top' | 'bottom';

interface ToastConfig {
  message: string;
  type?: ToastType;
  duration?: number;
  position?: ToastPosition;
  action?: {
    label: string;
    onPress: () => void;
  };
}

interface ToastItem extends ToastConfig {
  id: string;
}

interface ToastContextType {
  show: (config: ToastConfig | string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
  hide: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Toast Item Component
const ToastItemComponent: React.FC<{
  toast: ToastItem;
  onHide: (id: string) => void;
  position: ToastPosition;
  safeAreaTop: number;
  safeAreaBottom: number;
}> = ({ toast, onHide, position, safeAreaTop, safeAreaBottom }) => {
  const styles = useStyles();
  const colors = useThemeColors();
  const translateY = useRef(new Animated.Value(position === 'top' ? -100 : 100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    // Animate in
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto hide
    const duration = toast.duration || 3000;
    const timer = setTimeout(() => {
      hideToast();
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: position === 'top' ? -100 : 100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide(toast.id);
    });
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return 'checkmark-circle';
      case 'error':
        return 'close-circle';
      case 'warning':
        return 'warning';
      default:
        return 'information-circle';
    }
  };

  const getBackgroundColor = () => {
    switch (toast.type) {
      case 'success':
        return colors.success;
      case 'error':
        return colors.error;
      case 'warning':
        return colors.warning;
      default:
        return colors.info;
    }
  };

  return (
    <Animated.View
      style={[
        styles.toastItem,
        {
          backgroundColor: getBackgroundColor(),
          transform: [{ translateY }],
          opacity,
          [position === 'top' ? 'marginTop' : 'marginBottom']:
            position === 'top' ? safeAreaTop + spacing.sm : safeAreaBottom + spacing.sm,
        },
      ]}
    >
      <View style={styles.toastContent}>
        <Ionicons name={getIcon()} size={24} color={colors.text.inverse} />
        <Text style={styles.toastMessage} numberOfLines={3}>
          {toast.message}
        </Text>
        {toast.action && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              toast.action?.onPress();
              hideToast();
            }}
          >
            <Text style={styles.actionText}>{toast.action.label}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={hideToast} style={styles.closeToastButton}>
          <Ionicons name="close" size={20} color={colors.text.inverse} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

// Toast Provider Component
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const styles = useStyles();
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const insets = useSafeAreaInsets();
  const idCounter = useRef(0);

  const show = useCallback((config: ToastConfig | string) => {
    const toastConfig: ToastConfig = typeof config === 'string' ? { message: config } : config;

    const id = `toast-${idCounter.current++}`;
    const newToast: ToastItem = {
      ...toastConfig,
      id,
      type: toastConfig.type || 'info',
      duration: toastConfig.duration || 3000,
      position: toastConfig.position || 'top',
    };

    if (newToast.type === 'success') haptics.success();
    else if (newToast.type === 'error') haptics.error();
    else if (newToast.type === 'warning') haptics.warning();

    setToasts((prev) => [...prev, newToast]);
  }, []);

  const hide = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback(
    (message: string) => {
      show({ message, type: 'success' });
    },
    [show]
  );

  const error = useCallback(
    (message: string) => {
      show({ message, type: 'error' });
    },
    [show]
  );

  const warning = useCallback(
    (message: string) => {
      show({ message, type: 'warning' });
    },
    [show]
  );

  const info = useCallback(
    (message: string) => {
      show({ message, type: 'info' });
    },
    [show]
  );

  const topToasts = toasts.filter((t) => t.position === 'top');
  const bottomToasts = toasts.filter((t) => t.position === 'bottom');

  return (
    <ToastContext.Provider value={{ show, success, error, warning, info, hide }}>
      {children}

      {/* Top Toasts */}
      <View style={[styles.topContainer]} pointerEvents="box-none">
        {topToasts.map((toast) => (
          <ToastItemComponent
            key={toast.id}
            toast={toast}
            onHide={hide}
            position="top"
            safeAreaTop={insets.top}
            safeAreaBottom={insets.bottom}
          />
        ))}
      </View>

      {/* Bottom Toasts */}
      <View style={[styles.bottomContainer]} pointerEvents="box-none">
        {bottomToasts.map((toast) => (
          <ToastItemComponent
            key={toast.id}
            toast={toast}
            onHide={hide}
            position="bottom"
            safeAreaTop={insets.top}
            safeAreaBottom={insets.bottom}
          />
        ))}
      </View>
    </ToastContext.Provider>
  );
};

const useStyles = makeThemedStyles((colors) =>
  StyleSheet.create({
    topContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      alignItems: 'center',
      zIndex: 9999,
    },
    bottomContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      alignItems: 'center',
      zIndex: 9999,
    },
    toastItem: {
      width: SCREEN_WIDTH - spacing.lg * 2,
      maxWidth: 400,
      borderRadius: spacing.borderRadius.md,
      marginVertical: spacing.xs,
      ...Platform.select({
        ios: {
          shadowColor: colors.text.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        },
        android: {
          elevation: 8,
        },
      }),
    },
    toastContent: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.md,
      paddingRight: spacing.sm,
    },
    toastMessage: {
      flex: 1,
      fontSize: typography.fontSize.sm,
      color: colors.text.inverse,
      marginLeft: spacing.sm,
      fontWeight: typography.fontWeight.medium,
    },
    actionButton: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      marginLeft: spacing.sm,
    },
    actionText: {
      fontSize: typography.fontSize.sm,
      color: colors.text.inverse,
      fontWeight: typography.fontWeight.bold,
      textDecorationLine: 'underline',
    },
    closeToastButton: {
      padding: spacing.xs,
      marginLeft: spacing.xs,
    },
  })
);
