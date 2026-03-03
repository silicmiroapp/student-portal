import { useState, useEffect } from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Card } from '@/components/ui/Card';
import { useTheme } from '@/hooks/useTheme';
import { useNotificationStore } from '@/features/notifications/store';
import { SPACING, FONTS } from '@/constants/theme';

export function NotificationPreferencesForm() {
  const { colors, fontSize } = useTheme();
  const {
    preferences,
    isLoadingPreferences,
    fetchPreferences,
    updatePreferences,
  } = useNotificationStore();

  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  async function handleToggle(
    key: string,
    value: boolean
  ) {
    setSaving(key);
    try {
      await updatePreferences({ [key]: value });
    } catch (err) {
      Alert.alert(
        'Error',
        err instanceof Error ? err.message : 'Failed to update preference.'
      );
    } finally {
      setSaving(null);
    }
  }

  if (isLoadingPreferences || !preferences) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const rows: {
    key: keyof typeof preferences;
    label: string;
    description: string;
    disabled?: boolean;
  }[] = [
    {
      key: 'pushEnabled',
      label: 'Push Notifications',
      description: 'Receive push notifications on this device',
    },
    {
      key: 'financePush',
      label: 'Payment Reminders',
      description: 'Due dates, overdue payments, and payment confirmations',
      disabled: !preferences.pushEnabled,
    },
    {
      key: 'gradesPush',
      label: 'Grade Updates',
      description: 'New grades, updated grades, and results releases',
      disabled: !preferences.pushEnabled,
    },
    {
      key: 'announcementsPush',
      label: 'Announcements',
      description: 'Admin announcements and campus updates',
      disabled: !preferences.pushEnabled,
    },
    {
      key: 'quietHoursEnabled',
      label: 'Quiet Hours',
      description: preferences.quietHoursEnabled
        ? `${preferences.quietHoursStart ?? '22:00'} – ${preferences.quietHoursEnd ?? '08:00'}`
        : 'Silence notifications during set hours',
      disabled: !preferences.pushEnabled,
    },
  ];

  return (
    <View>
      <Text
        style={[
          styles.sectionLabel,
          { color: colors.textSecondary, fontSize: fontSize.xs },
        ]}
      >
        NOTIFICATIONS
      </Text>

      {rows.map((row) => (
        <Card key={row.key} style={styles.card}>
          <View style={styles.row}>
            <View style={styles.info}>
              <Text
                style={[
                  styles.label,
                  {
                    color: row.disabled ? colors.textSecondary : colors.text,
                    fontSize: fontSize.sm,
                  },
                ]}
              >
                {row.label}
              </Text>
              <Text
                style={[
                  styles.description,
                  { color: colors.textSecondary, fontSize: fontSize.xs },
                ]}
              >
                {row.description}
              </Text>
            </View>
            {saving === row.key ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Switch
                value={preferences[row.key] as boolean}
                onValueChange={(val) => handleToggle(row.key, val)}
                disabled={row.disabled}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.textLight}
              />
            )}
          </View>
        </Card>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    paddingVertical: SPACING.xxl,
    alignItems: 'center',
  },
  sectionLabel: {
    fontFamily: FONTS.semiBold,
    letterSpacing: 1,
    marginBottom: SPACING.sm,
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },
  card: {
    marginBottom: SPACING.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginRight: SPACING.md,
  },
  label: {
    fontFamily: FONTS.semiBold,
    marginBottom: 2,
  },
  description: {
    fontFamily: FONTS.regular,
  },
});
