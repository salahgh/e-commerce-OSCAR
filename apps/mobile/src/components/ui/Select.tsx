import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  ViewStyle,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { makeThemedStyles, useThemeColors, spacing, typography } from '../../theme';

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

interface SelectProps {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  value?: string | number;
  onChange: (value: string | number) => void;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  containerStyle?: ViewStyle;
  searchable?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  label,
  placeholder,
  options,
  value,
  onChange,
  error,
  helperText,
  disabled = false,
  required = false,
  containerStyle,
  searchable = false,
}) => {
  const styles = useStyles();
  const colors = useThemeColors();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const resolvedPlaceholder = placeholder ?? t('products.selectOption');
  const selectedOption = options.find((opt) => opt.value === value);
  const hasError = !!error;

  const filteredOptions = searchable
    ? options.filter((opt) => opt.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : options;

  const handleSelect = (option: SelectOption) => {
    if (!option.disabled) {
      onChange(option.value);
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  const renderOption = ({ item }: { item: SelectOption }) => (
    <TouchableOpacity
      style={[
        styles.option,
        item.value === value && styles.optionSelected,
        item.disabled && styles.optionDisabled,
      ]}
      onPress={() => handleSelect(item)}
      disabled={item.disabled}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.optionText,
          item.value === value && styles.optionTextSelected,
          item.disabled && styles.optionTextDisabled,
        ]}
      >
        {item.label}
      </Text>
      {item.value === value && <Ionicons name="checkmark" size={20} color={colors.primary} />}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.selectButton,
          hasError && styles.selectButtonError,
          disabled && styles.selectButtonDisabled,
        ]}
        onPress={() => !disabled && setIsOpen(true)}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text style={[styles.selectText, !selectedOption && styles.placeholderText]}>
          {selectedOption ? selectedOption.label : resolvedPlaceholder}
        </Text>
        <Ionicons
          name="chevron-down"
          size={20}
          color={disabled ? colors.text.disabled : colors.text.secondary}
        />
      </TouchableOpacity>

      {(error || helperText) && (
        <Text style={[styles.helperText, hasError && styles.errorText]}>{error || helperText}</Text>
      )}

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setIsOpen(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{label || t('products.selectOption')}</Text>
                <TouchableOpacity onPress={() => setIsOpen(false)}>
                  <Ionicons name="close" size={24} color={colors.text.primary} />
                </TouchableOpacity>
              </View>

              {searchable && (
                <View style={styles.searchContainer}>
                  <Ionicons name="search" size={20} color={colors.text.tertiary} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder={`${t('common.search')}…`}
                    placeholderTextColor={colors.text.tertiary}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoCapitalize="none"
                  />
                </View>
              )}

              <FlatList
                data={filteredOptions}
                keyExtractor={(item) => String(item.value)}
                renderItem={renderOption}
                showsVerticalScrollIndicator={false}
                style={styles.optionsList}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>{t('common.noOptionsFound')}</Text>
                  </View>
                }
              />
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const useStyles = makeThemedStyles((colors) =>
  StyleSheet.create({
    container: {
      marginBottom: spacing.md,
    },
    labelContainer: {
      marginBottom: spacing.xs,
    },
    label: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      color: colors.text.primary,
    },
    required: {
      color: colors.error,
    },
    selectButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: spacing.borderRadius.md,
      paddingHorizontal: spacing.md,
      minHeight: 48,
    },
    selectButtonError: {
      borderColor: colors.error,
    },
    selectButtonDisabled: {
      backgroundColor: colors.background,
      opacity: 0.6,
    },
    selectText: {
      fontSize: typography.fontSize.md,
      color: colors.text.primary,
      flex: 1,
    },
    placeholderText: {
      color: colors.text.tertiary,
    },
    helperText: {
      fontSize: typography.fontSize.xs,
      color: colors.text.secondary,
      marginTop: spacing.xs,
      marginLeft: spacing.xs,
    },
    errorText: {
      color: colors.error,
    },
    overlay: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      width: '90%',
      maxHeight: '70%',
    },
    modalContent: {
      backgroundColor: colors.surface,
      borderRadius: spacing.borderRadius.lg,
      overflow: 'hidden',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semiBold,
      color: colors.text.primary,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      margin: spacing.md,
      paddingHorizontal: spacing.md,
      borderRadius: spacing.borderRadius.md,
    },
    searchInput: {
      flex: 1,
      fontSize: typography.fontSize.md,
      color: colors.text.primary,
      paddingVertical: spacing.md,
      marginLeft: spacing.sm,
    },
    optionsList: {
      maxHeight: 300,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    optionSelected: {
      backgroundColor: colors.secondaryLight,
    },
    optionDisabled: {
      opacity: 0.5,
    },
    optionText: {
      fontSize: typography.fontSize.md,
      color: colors.text.primary,
    },
    optionTextSelected: {
      color: colors.primary,
      fontWeight: typography.fontWeight.semiBold,
    },
    optionTextDisabled: {
      color: colors.text.disabled,
    },
    emptyContainer: {
      padding: spacing.xl,
      alignItems: 'center',
    },
    emptyText: {
      fontSize: typography.fontSize.md,
      color: colors.text.tertiary,
    },
  })
);
