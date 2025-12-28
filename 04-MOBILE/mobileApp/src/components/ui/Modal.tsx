import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal as RNModal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ViewStyle,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme';
import { Button } from './Button';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  animationType?: 'none' | 'slide' | 'fade';
  position?: 'center' | 'bottom';
  size?: 'small' | 'medium' | 'large' | 'full';
  contentStyle?: ViewStyle;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  showCloseButton = true,
  closeOnBackdrop = true,
  animationType = 'fade',
  position = 'center',
  size = 'medium',
  contentStyle,
  footer,
}) => {
  const getModalWidth = () => {
    switch (size) {
      case 'small':
        return '75%';
      case 'large':
        return '95%';
      case 'full':
        return '100%';
      default:
        return '85%';
    }
  };

  const getMaxHeight = () => {
    switch (size) {
      case 'small':
        return SCREEN_HEIGHT * 0.4;
      case 'large':
        return SCREEN_HEIGHT * 0.85;
      case 'full':
        return SCREEN_HEIGHT;
      default:
        return SCREEN_HEIGHT * 0.7;
    }
  };

  return (
    <RNModal
      visible={visible}
      transparent
      animationType={position === 'bottom' ? 'slide' : animationType}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <TouchableWithoutFeedback
          onPress={closeOnBackdrop ? onClose : undefined}
        >
          <View
            style={[
              styles.overlay,
              position === 'bottom' && styles.overlayBottom,
            ]}
          >
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View
                style={[
                  styles.container,
                  position === 'center' && styles.containerCenter,
                  position === 'bottom' && styles.containerBottom,
                  { width: getModalWidth(), maxHeight: getMaxHeight() },
                  size === 'full' && styles.containerFull,
                  contentStyle,
                ]}
              >
                {/* Header */}
                {(title || showCloseButton) && (
                  <View style={styles.header}>
                    <Text style={styles.title} numberOfLines={1}>
                      {title || ''}
                    </Text>
                    {showCloseButton && (
                      <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Ionicons
                          name="close"
                          size={24}
                          color={colors.text.secondary}
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {/* Content */}
                <ScrollView
                  style={styles.content}
                  contentContainerStyle={styles.contentContainer}
                  showsVerticalScrollIndicator={false}
                  bounces={false}
                >
                  {children}
                </ScrollView>

                {/* Footer */}
                {footer && <View style={styles.footer}>{footer}</View>}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </RNModal>
  );
};

// Confirmation Modal Component
interface ConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'danger';
  loading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  onClose,
  onConfirm,
  title = 'Confirm',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  loading = false,
}) => {
  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={title}
      size="small"
      showCloseButton={false}
      footer={
        <View style={styles.confirmFooter}>
          <Button
            title={cancelText}
            variant="outline"
            onPress={onClose}
            style={styles.confirmButton}
            disabled={loading}
          />
          <Button
            title={confirmText}
            variant={confirmVariant}
            onPress={onConfirm}
            style={styles.confirmButton}
            loading={loading}
          />
        </View>
      }
    >
      <Text style={styles.confirmMessage}>{message}</Text>
    </Modal>
  );
};

// Alert Modal Component
interface AlertModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  buttonText?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}

export const AlertModal: React.FC<AlertModalProps> = ({
  visible,
  onClose,
  title,
  message,
  buttonText = 'OK',
  type = 'info',
}) => {
  const getIconName = () => {
    switch (type) {
      case 'success':
        return 'checkmark-circle';
      case 'warning':
        return 'warning';
      case 'error':
        return 'close-circle';
      default:
        return 'information-circle';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'success':
        return colors.success;
      case 'warning':
        return colors.warning;
      case 'error':
        return colors.error;
      default:
        return colors.info;
    }
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      size="small"
      showCloseButton={false}
      footer={
        <Button
          title={buttonText}
          variant="primary"
          onPress={onClose}
          fullWidth
        />
      }
    >
      <View style={styles.alertContent}>
        <Ionicons name={getIconName()} size={48} color={getIconColor()} />
        {title && <Text style={styles.alertTitle}>{title}</Text>}
        <Text style={styles.alertMessage}>{message}</Text>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayBottom: {
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.lg,
    overflow: 'hidden',
  },
  containerCenter: {
    marginHorizontal: spacing.lg,
  },
  containerBottom: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderTopLeftRadius: spacing.borderRadius.xl,
    borderTopRightRadius: spacing.borderRadius.xl,
  },
  containerFull: {
    borderRadius: 0,
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.text.primary,
    flex: 1,
  },
  closeButton: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
  content: {
    flexGrow: 0,
  },
  contentContainer: {
    padding: spacing.lg,
  },
  footer: {
    padding: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  confirmFooter: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  confirmButton: {
    flex: 1,
  },
  confirmMessage: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  alertContent: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  alertTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.text.primary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  alertMessage: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    textAlign: 'center',
    lineHeight: 22,
  },
});
