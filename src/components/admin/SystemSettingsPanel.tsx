import { View, Text, StyleSheet, Switch, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SPACING, FONTS, BORDER_RADIUS } from '@/constants/theme';
import type { SystemSettings } from '@/types/rbac';

interface SystemSettingsPanelProps {
  settings: SystemSettings;
  isLoading: boolean;
  onToggleMaintenance: () => void;
  onToggleFeatureFlag: (flag: string) => void;
}

export function SystemSettingsPanel({
  settings,
  isLoading,
  onToggleMaintenance,
  onToggleFeatureFlag,
}: SystemSettingsPanelProps) {
  const { colors, fontSize } = useTheme();

  return (
    <View>
      {/* Maintenance Mode */}
      <SectionHeader title="System Controls" />
      <Card>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <View style={styles.settingHeader}>
              <Ionicons
                name="construct-outline"
                size={20}
                color={settings.maintenanceMode ? colors.error : colors.textSecondary}
              />
              <Text style={[styles.settingLabel, { color: colors.text, fontSize: fontSize.sm }]}>
                Maintenance Mode
              </Text>
              {settings.maintenanceMode && <Badge label="ACTIVE" variant="error" />}
            </View>
            <Text style={[styles.settingDesc, { color: colors.textSecondary, fontSize: fontSize.xs }]}>
              When enabled, users see a maintenance message instead of the app
            </Text>
          </View>
          <Switch
            value={settings.maintenanceMode}
            onValueChange={onToggleMaintenance}
            disabled={isLoading}
            trackColor={{ false: colors.border, true: colors.error }}
            thumbColor={colors.surface}
          />
        </View>

        <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

        {/* Session Timeout */}
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <View style={styles.settingHeader}>
              <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
              <Text style={[styles.settingLabel, { color: colors.text, fontSize: fontSize.sm }]}>
                Session Timeout
              </Text>
            </View>
            <Text style={[styles.settingDesc, { color: colors.textSecondary, fontSize: fontSize.xs }]}>
              Users: {settings.sessionTimeoutMinutes}min · Admins: {settings.adminSessionTimeoutMinutes}min
            </Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

        {/* Password Policy */}
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <View style={styles.settingHeader}>
              <Ionicons name="key-outline" size={20} color={colors.textSecondary} />
              <Text style={[styles.settingLabel, { color: colors.text, fontSize: fontSize.sm }]}>
                Password Policy
              </Text>
            </View>
            <Text style={[styles.settingDesc, { color: colors.textSecondary, fontSize: fontSize.xs }]}>
              Min {settings.passwordPolicy.minLength} chars
              {settings.passwordPolicy.requireUppercase ? ' · uppercase' : ''}
              {settings.passwordPolicy.requireLowercase ? ' · lowercase' : ''}
              {settings.passwordPolicy.requireNumbers ? ' · numbers' : ''}
              {settings.passwordPolicy.requireSpecialChars ? ' · special chars' : ''}
            </Text>
            <Text style={[styles.settingDesc, { color: colors.textSecondary, fontSize: fontSize.xs }]}>
              Max age: {settings.passwordPolicy.maxAgeDays} days · Prevent reuse: {settings.passwordPolicy.preventReuse} passwords
            </Text>
          </View>
        </View>
      </Card>

      {/* Feature Flags */}
      <View style={styles.section}>
        <SectionHeader title="Feature Flags" />
        <Card>
          {Object.entries(settings.featureFlags).map(([flag, enabled], index, arr) => (
            <View key={flag}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <View style={styles.settingHeader}>
                    <Ionicons
                      name={enabled ? 'toggle-outline' : 'toggle-outline'}
                      size={20}
                      color={enabled ? colors.success : colors.textSecondary}
                    />
                    <Text style={[styles.settingLabel, { color: colors.text, fontSize: fontSize.sm }]}>
                      {flag.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={enabled}
                  onValueChange={() => onToggleFeatureFlag(flag)}
                  disabled={isLoading}
                  trackColor={{ false: colors.border, true: colors.success }}
                  thumbColor={colors.surface}
                />
              </View>
              {index < arr.length - 1 && (
                <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />
              )}
            </View>
          ))}
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: SPACING.lg,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  settingInfo: {
    flex: 1,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  settingLabel: {
    fontFamily: FONTS.semiBold,
  },
  settingDesc: {
    fontFamily: FONTS.regular,
    marginTop: 4,
    paddingLeft: 28,
  },
  divider: {
    height: 1,
  },
});
