/**
 * Purpose: Base friendly overlay modal component with rounded corners, large dismiss targets, and voice line trigger support.
 * Module: Shared Components
 * Folder: frontend/src/components
 */

import React, { useEffect } from 'react';
import { Modal, View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BigTouchTarget } from './BigTouchTarget';
import { Typography } from '../theme/typography';
import { Colors } from '../theme/colors';

export interface FriendlyModalProps {
  visible: boolean;
  onDismiss: () => void;
  title: string;
  description?: string;
  dismissText?: string;
  onMountVoiceLine?: () => void;
  accessibilityLabel?: string;
  children?: React.ReactNode;
  style?: ViewStyle;
}

export const FriendlyModal: React.FC<FriendlyModalProps> = React.memo(
  ({
    visible,
    onDismiss,
    title,
    description,
    dismissText,
    onMountVoiceLine,
    accessibilityLabel,
    children,
    style,
  }) => {
    const { t } = useTranslation();
    const resolvedDismissText = dismissText || t('game.ok');

    useEffect(() => {
      if (visible && onMountVoiceLine) {
        onMountVoiceLine();
      }
    }, [visible, onMountVoiceLine]);

    const modalLabel = accessibilityLabel || title;

    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onDismiss}
      >
        <View
          style={styles.backdrop}
          accessibilityViewIsModal={true}
          aria-modal={true}
          role="dialog"
        >
          <View
            style={[styles.modalCard, style]}
            accessibilityLabel={modalLabel}
            accessibilityRole="alert"
          >
            <Text style={styles.titleText}>{title}</Text>
            {description ? <Text style={styles.descText}>{description}</Text> : null}

            {children}

            <BigTouchTarget
              onPress={onDismiss}
              accessibilityLabel={t('accessibility.closeModal', { title })}
              accessibilityRole="button"
              style={styles.dismissButton}
            >
              <Text style={styles.dismissButtonText}>{resolvedDismissText}</Text>
            </BigTouchTarget>
          </View>
        </View>
      </Modal>
    );
  }
);

FriendlyModal.displayName = 'FriendlyModal';

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: Colors.neutral.backdrop,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: Colors.neutral.surface,
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    shadowColor: Colors.neutral.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  titleText: {
    fontFamily: Typography.fonts.bold,
    fontSize: Typography.sizes.lg,
    color: Colors.neutral.textDark,
    textAlign: 'center',
    marginBottom: 8,
  },
  descText: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.sm,
    color: Colors.neutral.textMuted,
    textAlign: 'center',
    marginBottom: 16,
  },
  dismissButton: {
    width: '100%',
    height: 56,
    minHeight: 84,
    backgroundColor: Colors.primary.main,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  dismissButtonText: {
    fontFamily: Typography.fonts.bold,
    fontSize: Typography.sizes.md,
    color: Colors.primary.textOnPrimary,
  },
});
