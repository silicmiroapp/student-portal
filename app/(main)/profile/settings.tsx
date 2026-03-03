import { View, Text, ScrollView, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { useTheme } from '@/hooks/useTheme';
import { useSettingsStore, type ThemeMode, type FontScale } from '@/features/settings/store';
import { NotificationPreferencesForm } from '@/components/notifications/NotificationPreferencesForm';
import {
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
  FONTS,
} from '@/constants/theme';

const THEME_OPTIONS: { label: string; value: ThemeMode }[] = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'System', value: 'system' },
];

const FONT_SCALE_OPTIONS: { label: string; value: FontScale }[] = [
  { label: 'S', value: 'small' },
  { label: 'Default', value: 'default' },
  { label: 'L', value: 'large' },
  { label: 'XL', value: 'extra-large' },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, fontSize } = useTheme();
  const {
    themeMode,
    fontScale,
    highContrast,
    reduceMotion,
    setThemeMode,
    setFontScale,
    setHighContrast,
    setReduceMotion,
  } = useSettingsStore();

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.surface }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.borderLight }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: colors.surfaceAlt }]}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text, fontSize: fontSize.lg }]}>
          Settings
        </Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Appearance Section */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary, fontSize: fontSize.xs }]}>
          APPEARANCE
        </Text>
        <Card style={styles.card}>
          <Text style={[styles.settingLabel, { color: colors.text, fontSize: fontSize.sm }]}>
            Theme
          </Text>
          <View style={styles.settingControl}>
            <SegmentedControl
              items={THEME_OPTIONS}
              selectedValue={themeMode}
              onSelect={setThemeMode}
            />
          </View>
        </Card>

        {/* Accessibility Section */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary, fontSize: fontSize.xs }]}>
          ACCESSIBILITY
        </Text>
        <Card style={styles.card}>
          <Text style={[styles.settingLabel, { color: colors.text, fontSize: fontSize.sm }]}>
            Font Size
          </Text>
          <View style={styles.settingControl}>
            <SegmentedControl
              items={FONT_SCALE_OPTIONS}
              selectedValue={fontScale}
              onSelect={setFontScale}
            />
          </View>
        </Card>

        <Card style={styles.card}>
          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={[styles.settingLabel, { color: colors.text, fontSize: fontSize.sm }]}>
                High Contrast
              </Text>
              <Text style={[styles.settingDesc, { color: colors.textSecondary, fontSize: fontSize.xs }]}>
                Increases color contrast for readability
              </Text>
            </View>
            <Switch
              value={highContrast}
              onValueChange={setHighContrast}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.textLight}
            />
          </View>
        </Card>

        <Card style={styles.card}>
          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={[styles.settingLabel, { color: colors.text, fontSize: fontSize.sm }]}>
                Reduce Motion
              </Text>
              <Text style={[styles.settingDesc, { color: colors.textSecondary, fontSize: fontSize.xs }]}>
                Minimizes animations and transitions
              </Text>
            </View>
            <Switch
              value={reduceMotion}
              onValueChange={setReduceMotion}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.textLight}
            />
          </View>
        </Card>

        {/* Notification Preferences */}
        <NotificationPreferencesForm />

        {/* Preview Section */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary, fontSize: fontSize.xs }]}>
          PREVIEW
        </Text>
        <Card style={styles.card}>
          <Text style={[styles.previewTitle, { color: colors.text, fontSize: fontSize.md }]}>
            Sample Card
          </Text>
          <Text style={[styles.previewBody, { color: colors.textSecondary, fontSize: fontSize.sm }]}>
            This is how your content will look with the current settings applied.
          </Text>
          <View style={styles.previewRow}>
            <View style={[styles.previewBadge, { backgroundColor: colors.successLight }]}>
              <Text style={[styles.previewBadgeText, { color: colors.success, fontSize: fontSize.xs }]}>
                Active
              </Text>
            </View>
            <View style={[styles.previewBadge, { backgroundColor: colors.infoLight }]}>
              <Text style={[styles.previewBadgeText, { color: colors.info, fontSize: fontSize.xs }]}>
                Info
              </Text>
            </View>
            <View style={[styles.previewBadge, { backgroundColor: colors.warningLight }]}>
              <Text style={[styles.previewBadgeText, { color: colors.warning, fontSize: fontSize.xs }]}>
                Warning
              </Text>
            </View>
          </View>
        </Card>

        <View style={{ height: insets.bottom + SPACING.xxl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    ...SHADOWS.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: FONTS.bold,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  sectionLabel: {
    fontFamily: FONTS.semiBold,
    letterSpacing: 1,
    marginBottom: SPACING.sm,
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },
  card: {
    marginBottom: SPACING.md,
  },
  settingLabel: {
    fontFamily: FONTS.semiBold,
    marginBottom: SPACING.sm,
  },
  settingDesc: {
    fontFamily: FONTS.regular,
    marginTop: 2,
  },
  settingControl: {
    marginTop: SPACING.xs,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  previewTitle: {
    fontFamily: FONTS.semiBold,
    marginBottom: SPACING.sm,
  },
  previewBody: {
    fontFamily: FONTS.regular,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  previewRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  previewBadge: {
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  previewBadgeText: {
    fontFamily: FONTS.semiBold,
  },
});
