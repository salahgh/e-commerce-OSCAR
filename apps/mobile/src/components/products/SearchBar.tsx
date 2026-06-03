import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { spacing, typography, makeThemedStyles, useThemeColors } from '../../theme';
import { useAppFont } from '../../hooks/useAppFont';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSearch?: (text: string) => void;
  onClear?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  loading?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onSearch,
  onClear,
  placeholder,
  autoFocus = false,
  loading = false,
}) => {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const { fontFamily } = useAppFont();
  const styles = useStyles();
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    onChangeText('');
    if (onClear) {
      onClear();
    }
  };

  const handleSearch = () => {
    if (onSearch && value.trim()) {
      onSearch(value.trim());
    }
  };

  return (
    <View style={[styles.container, isFocused && styles.containerFocused]}>
      {/* Search Icon */}
      <Ionicons name="search" size={20} color={colors.text.tertiary} style={styles.searchIcon} />

      {/* Input */}
      <TextInput
        style={[styles.input, { fontFamily: fontFamily.regular }]}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={handleSearch}
        placeholder={placeholder || t('products.searchPlaceholder', 'Search products...')}
        placeholderTextColor={colors.text.tertiary}
        autoFocus={autoFocus}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />

      {/* Loading or Clear Button */}
      {loading ? (
        <ActivityIndicator size="small" color={colors.primary} style={styles.rightIcon} />
      ) : value.length > 0 ? (
        <TouchableOpacity
          onPress={handleClear}
          style={styles.clearButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close-circle" size={20} color={colors.text.tertiary} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const useStyles = makeThemedStyles((colors) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: spacing.md,
      height: 48,
    },
    containerFocused: {
      borderColor: colors.primary,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    searchIcon: {
      marginRight: spacing.sm,
    },
    input: {
      flex: 1,
      ...typography.styles.body,
      color: colors.text.primary,
      padding: 0,
    },
    rightIcon: {
      marginLeft: spacing.sm,
    },
    clearButton: {
      marginLeft: spacing.sm,
      padding: spacing.xs,
    },
  })
);
