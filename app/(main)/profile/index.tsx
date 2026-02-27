import { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useAuthStore } from '@/features/auth/store';
import { useProfileStore } from '@/features/profile/store';
import type { AcademicStatus } from '@/types/grades';
import {
  COLORS,
  SPACING,
  FONT_SIZE,
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
  const { logout, isLoading: isLoggingOut } = useAuthStore();
  const { profile, isLoading, fetchProfile } = useProfileStore();

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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Avatar name={profile?.name ?? 'U'} imageUrl={profile?.avatarUrl} size={80} />
          <Text style={styles.name}>{profile?.name ?? 'Student'}</Text>
          <Text style={styles.studentId}>{profile?.studentId}</Text>
          {standing && (
            <Badge label={standing.label} variant={standing.variant} />
          )}
        </View>

        {/* Academic Info */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Academic Information</Text>
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
            <Text style={styles.cardTitle}>Credits Progress</Text>
            <View style={styles.creditsRow}>
              <Text style={styles.creditsLabel}>
                {profile.completedCredits} / {profile.totalCredits} credits
              </Text>
              <Text style={styles.creditsPercent}>{Math.round(creditProgress)}%</Text>
            </View>
            <ProgressBar progress={creditProgress} color={COLORS.success} />
          </Card>
        )}

        {/* Contact Info */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Contact</Text>
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
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
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
    fontSize: FONT_SIZE.xl,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  studentId: {
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  card: {
    marginBottom: SPACING.md,
  },
  cardTitle: {
    fontSize: FONT_SIZE.md,
    fontFamily: FONTS.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  infoLabel: {
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.semiBold,
    color: COLORS.text,
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
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  creditsPercent: {
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.semiBold,
    color: COLORS.text,
  },
  signOutSection: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
  },
});
