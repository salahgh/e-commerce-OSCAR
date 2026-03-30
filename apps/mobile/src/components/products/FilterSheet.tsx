import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme';
import { useTranslation } from 'react-i18next';
import { useAppFont } from '../../hooks/useAppFont';
import { Button } from '../ui';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const POPUP_WIDTH = Math.min(SCREEN_WIDTH - 48, 340);

interface FilterSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onClear: () => void;
  onSave: () => void;
  clearLabel?: string;
  saveLabel?: string;
  resultCount?: number;
}

export const FilterSheet: React.FC<FilterSheetProps> = ({
  visible,
  onClose,
  title,
  children,
  onClear,
  onSave,
  clearLabel,
  saveLabel,
  resultCount,
}) => {
  const { fontFamily } = useAppFont();
  const { t } = useTranslation();
  const resolvedClearLabel = clearLabel || t('filters.clearAll');
  const resolvedSaveLabel = saveLabel || t('filters.save');

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.popup}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={[styles.title, { fontFamily: fontFamily.medium }]}>{title}</Text>
                <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons name="close" size={22} color={colors.text.primary} />
                </TouchableOpacity>
              </View>

              {/* Content */}
              <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {children}
              </ScrollView>

              {/* Footer */}
              <View style={styles.footer}>
                <Button
                  title={resolvedClearLabel}
                  variant="outline"
                  onPress={onClear}
                  size="medium"
                  style={styles.footerButton}
                />
                <Button
                  title={resultCount !== undefined ? `${resolvedSaveLabel} (${resultCount})` : resolvedSaveLabel}
                  variant="primary"
                  onPress={onSave}
                  size="medium"
                  style={styles.footerButton}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popup: {
    width: POPUP_WIDTH,
    backgroundColor: colors.surface,
    borderRadius: 16,
    maxHeight: '70%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.lg,
    color: colors.text.primary,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  footerButton: {
    flex: 1,
  },
});
