import { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useAuthStore } from '@/features/auth/store';
import { useProfileStore } from '@/features/profile/store';
import { useTheme } from '@/hooks/useTheme';
import type { AcademicStatus } from '@/types/grades';
import {
  SPACING,
  BORDER_RADIUS,
  FONTS,
} from '@/constants/theme';

const STANDING_CONFIG: Record<AcademicStatus, { label: string; variant: 'success' | 'warning' | 'error' | 'info' }> = {
  good_standing: { label: 'Good Standing', variant: 'success' },
  deans_list: { label: "Dean's List", variant: 'info' },
  probation: { label: 'Probation', variant: 'error' },
  warning: { label: 'Warning', variant: 'warning' },
};

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { logout, isLoading: isLoggingOut } = useAuthStore();
  const { profile, isLoading, fetchProfile } = useProfileStore();
  const { colors, fontSize } = useTheme();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (isLoading && !profile) {
    return <LoadingScreen />;
  }

  const standing = profile ? STANDING_CONFIG[profile.academicStanding] : null;
  const creditProgress = profile && profile.totalCredits > 0
    ? (profile.completedCredits / profile.totalCredits) * 100
    : 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.surface }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Avatar name={profile?.name ?? 'U'} imageUrl={profile?.avatarUrl} size={80} />
          <Text style={[styles.name, { color: colors.text, fontSize: fontSize.xl }]}>
            {profile?.name ?? 'Student'}
          </Text>
          <Text style={[styles.studentId, { color: colors.textSecondary, fontSize: fontSize.sm }]}>
            {profile?.studentId}
          </Text>
          {standing && (
            <Badge label={standing.label} variant={standing.variant} />
          )}
        </View>

        {/* Settings Button */}
        <TouchableOpacity
          style={[styles.settingsButton, { backgroundColor: colors.background, borderColor: colors.borderLight }]}
          onPress={() => router.push('/(main)/profile/settings')}
          activeOpacity={0.7}
        >
          <Ionicons name="settings-outline" size={20} color={colors.textSecondary} />
          <Text style={[styles.settingsText, { color: colors.text, fontSize: fontSize.sm }]}>
            Settings
          </Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* Academic Info */}
        <Card style={styles.card}>
          <Text style={[styles.cardTitle, { color: colors.text, fontSize: fontSize.md }]}>
            Academic Information
          </Text>
          <InfoRow label="Program" value={profile?.program ?? '—'} />
          <InfoRow label="Department" value={profile?.department ?? '—'} />
          <InfoRow label="Enrollment Year" value={String(profile?.enrollmentYear ?? '—')} />
          <InfoRow label="Expected Graduation" value={
            profile?.expectedGraduation
              ? new Date(profile.expectedGraduation).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
              : '—'
          } />
          <InfoRow label="Academic Advisor" value={profile?.advisor ?? '—'} />
        </Card>

        {/* Credits Progress */}
        {profile && (
          <Card style={styles.card}>
            <Text style={[styles.cardTitle, { color: colors.text, fontSize: fontSize.md }]}>
              Credits Progress
            </Text>
            <View style={styles.creditsRow}>
              <Text style={[styles.creditsLabel, { color: colors.textSecondary, fontSize: fontSize.sm }]}>
                {profile.completedCredits} / {profile.totalCredits} credits
              </Text>
              <Text style={[styles.creditsPercent, { color: colors.text, fontSize: fontSize.sm }]}>
                {Math.round(creditProgress)}%
              </Text>
            </View>
            <ProgressBar progress={creditProgress} color={colors.success} />
          </Card>
        )}

        {/* Contact Info */}
        <Card style={styles.card}>
          <Text style={[styles.cardTitle, { color: colors.text, fontSize: fontSize.md }]}>
            Contact
          </Text>
          <InfoRow label="Email" value={profile?.email ?? '—'} />
          {profile?.phone && <InfoRow label="Phone" value={profile.phone} />}
          <InfoRow label="LMS Username" value={profile?.lmsUsername ?? '—'} />
        </Card>

        {/* Sign Out */}
        <View style={styles.signOutSection}>
          <Button
            title="Sign Out"
            onPress={logout}
            variant="outline"
            isLoading={isLoggingOut}
          />
        </View>

        <View style={{ height: insets.bottom + SPACING.lg }} />
      </ScrollView>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  const { colors, fontSize } = useTheme();

  return (
    <View style={[styles.infoRow, { borderBottomColor: colors.borderLight }]}>
      <Text style={[styles.infoLabel, { color: colors.textSecondary, fontSize: fontSize.sm }]}>
        {label}
      </Text>
      <Text style={[styles.infoValue, { color: colors.text, fontSize: fontSize.sm }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    paddingVertical: SPACING.lg,
  },
  name: {
    fontFamily: FONTS.bold,
    marginTop: SPACING.md,
  },
  studentId: {
    fontFamily: FONTS.regular,
    marginTop: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  settingsText: {
    flex: 1,
    fontFamily: FONTS.semiBold,
  },
  card: {
    marginBottom: SPACING.md,
  },
  cardTitle: {
    fontFamily: FONTS.semiBold,
    marginBottom: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
  },
  infoLabel: {
    fontFamily: FONTS.regular,
  },
  infoValue: {
    fontFamily: FONTS.semiBold,
    flexShrink: 1,
    textAlign: 'right',
    marginLeft: SPACING.md,
  },
  creditsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  creditsLabel: {
    fontFamily: FONTS.regular,
  },
  creditsPercent: {
    fontFamily: FONTS.semiBold,
  },
  signOutSection: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
  },
});
