import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Avatar } from '../ui';
import { spacing, typography, makeThemedStyles, useThemeColors } from '../../theme';

interface ProfileHeaderProps {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  onEditPress?: () => void;
  showEditButton?: boolean;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  firstName,
  lastName,
  email,
  phone,
  onEditPress,
  showEditButton = true,
}) => {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useStyles();

  const fullName = `${firstName} ${lastName}`;
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  return (
    <View style={styles.container}>
      {/* Avatar */}
      <Avatar size={80} name={fullName} />

      {/* User Info */}
      <View style={styles.info}>
        <Text style={styles.name}>{fullName}</Text>
        <View style={styles.contactInfo}>
          <View style={styles.contactRow}>
            <Ionicons name="mail-outline" size={16} color={colors.text.secondary} />
            <Text style={styles.contactText}>{email}</Text>
          </View>
          {phone && (
            <View style={styles.contactRow}>
              <Ionicons name="call-outline" size={16} color={colors.text.secondary} />
              <Text style={styles.contactText}>{phone}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Edit Button */}
      {showEditButton && onEditPress && (
        <TouchableOpacity style={styles.editButton} onPress={onEditPress} activeOpacity={0.7}>
          <Ionicons name="pencil" size={20} color={colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const useStyles = makeThemedStyles((colors) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      padding: spacing.lg,
      borderRadius: 12,
      marginBottom: spacing.lg,
      elevation: 2,
      shadowColor: colors.text.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    info: {
      flex: 1,
      marginLeft: spacing.md,
    },
    name: {
      ...typography.styles.h4,
      fontWeight: typography.fontWeight.bold,
      color: colors.text.primary,
      marginBottom: spacing.xs,
    },
    contactInfo: {
      gap: spacing.xs,
    },
    contactRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    contactText: {
      ...typography.styles.bodySmall,
      color: colors.text.secondary,
    },
    editButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary + '20',
      justifyContent: 'center',
      alignItems: 'center',
    },
  })
);
