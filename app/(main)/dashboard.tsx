import { useEffect, useCallback } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '@/components/ui/Avatar';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { QuickStatsRow } from '@/components/dashboard/QuickStatsRow';
import { UpcomingDeadlineCard } from '@/components/dashboard/UpcomingDeadlineCard';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useAuthStore } from '@/features/auth/store';
import { useDashboardStore } from '@/features/dashboard/store';
import { useFinanceStore } from '@/features/finance/store';
import { PaymentNotificationBanner } from '@/components/finance/PaymentNotificationBanner';
import { useRefreshOnFocus } from '@/hooks/useRefreshOnFocus';
import { useTheme } from '@/hooks/useTheme';
import {
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
  FONTS,
} from '@/constants/theme';

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuthStore();
  const { data, isLoading, fetchDashboard } = useDashboardStore();
  const { summary: financeSummary, fetchSummary: fetchFinanceSummary } = useFinanceStore();
  const { colors, fontSize } = useTheme();

  useEffect(() => {
    fetchDashboard();
    fetchFinanceSummary();
  }, [fetchDashboard, fetchFinanceSummary]);

  useRefreshOnFocus(fetchDashboard);

  const onRefresh = useCallback(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (isLoading && !data) {
    return <LoadingScreen />;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.surface }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.borderLight }]}>
        <View style={styles.headerLeft}>
          <Image
            source={require('../../assets/NewLOGO2022_BlackRed.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <View>
            <Text style={[styles.greeting, { color: colors.textSecondary, fontSize: fontSize.sm }]}>
              Good {getGreeting()},
            </Text>
            <Text style={[styles.userName, { color: colors.text, fontSize: fontSize.xl }]}>
              {user?.name ?? 'Student'}
            </Text>
            {user?.program && (
              <Text style={[styles.program, { color: colors.textSecondary, fontSize: fontSize.xs }]}>
                {user.program}
              </Text>
            )}
          </View>
        </View>
        <Avatar name={user?.name ?? 'U'} imageUrl={user?.avatarUrl} size={48} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        }
      >
        {/* Quick Stats */}
        {data?.stats && (
          <View style={styles.section}>
            <SectionHeader title="Overview" />
            <QuickStatsRow stats={data.stats} />
          </View>
        )}

        {/* Payment Notification */}
        {financeSummary && (financeSummary.overdueCount > 0 || financeSummary.nextDueAmount) && (
          <View style={styles.section}>
            <PaymentNotificationBanner
              summary={financeSummary}
              onPress={() => router.push('/(main)/finance')}
            />
          </View>
        )}

        {/* Recent Courses */}
        {data?.recentCourses && data.recentCourses.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Recent Courses"
              actionLabel="See All"
              onAction={() => router.push('/(main)/courses')}
            />
            {data.recentCourses.map((enrollment) => (
              <Card
                key={enrollment.id}
                onPress={() => router.push(`/(main)/courses/${enrollment.course.id}`)}
                style={styles.courseCard}
              >
                <View style={styles.courseRow}>
                  <View style={styles.courseInfo}>
                    <Text style={[styles.courseCode, { color: colors.secondary, fontSize: fontSize.xs }]}>
                      {enrollment.course.code}
                    </Text>
                    <Text style={[styles.courseName, { color: colors.text, fontSize: fontSize.sm }]} numberOfLines={1}>
                      {enrollment.course.name}
                    </Text>
                  </View>
                  <Text style={[styles.courseProgress, { color: colors.textSecondary, fontSize: fontSize.sm }]}>
                    {enrollment.progress}%
                  </Text>
                </View>
                <ProgressBar progress={enrollment.progress} height={6} />
              </Card>
            ))}
          </View>
        )}

        {/* Upcoming Deadlines */}
        {data?.upcomingDeadlines && data.upcomingDeadlines.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Upcoming Deadlines" />
            <Card>
              {data.upcomingDeadlines.map((deadline, index) => (
                <View key={deadline.id}>
                  <UpcomingDeadlineCard deadline={deadline} />
                  {index < data.upcomingDeadlines.length - 1 && (
                    <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />
                  )}
                </View>
              ))}
            </Card>
          </View>
        )}

        {/* Upcoming Exams */}
        {data?.upcomingExams && data.upcomingExams.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Upcoming Exams" />
            <Card>
              {data.upcomingExams.map((exam, index) => (
                <View key={exam.id}>
                  <View style={styles.examRow}>
                    <View style={[styles.examIconContainer, { backgroundColor: colors.warningLight }]}>
                      <Ionicons name="school-outline" size={18} color={colors.warning} />
                    </View>
                    <View style={styles.examInfo}>
                      <Text style={[styles.examSubject, { color: colors.text, fontSize: fontSize.sm }]}>
                        {exam.subjectName}
                      </Text>
                      <Text style={[styles.examMeta, { color: colors.textSecondary, fontSize: fontSize.xs }]}>
                        {formatDate(exam.date)} · {exam.startTime} - {exam.endTime}
                      </Text>
                      <Text style={[styles.examLocation, { color: colors.textSecondary, fontSize: fontSize.xs }]}>
                        {exam.location}
                      </Text>
                    </View>
                  </View>
                  {index < data.upcomingExams.length - 1 && (
                    <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />
                  )}
                </View>
              ))}
            </Card>
          </View>
        )}

        <View style={{ height: insets.bottom + SPACING.lg }} />
      </ScrollView>
    </View>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    ...SHADOWS.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerLogo: {
    width: 110,
    height: 28,
  },
  greeting: {
    fontFamily: FONTS.regular,
  },
  userName: {
    fontFamily: FONTS.bold,
  },
  program: {
    fontFamily: FONTS.regular,
    marginTop: 2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  section: {
    marginBottom: 28,
  },
  courseCard: {
    marginBottom: SPACING.sm,
  },
  courseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  courseInfo: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  courseCode: {
    fontFamily: FONTS.semiBold,
  },
  courseName: {
    fontFamily: FONTS.semiBold,
    marginTop: 2,
  },
  courseProgress: {
    fontFamily: FONTS.semiBold,
  },
  divider: {
    height: 1,
  },
  examRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    gap: SPACING.md,
  },
  examIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  examInfo: {
    flex: 1,
  },
  examSubject: {
    fontFamily: FONTS.semiBold,
  },
  examMeta: {
    fontFamily: FONTS.regular,
    marginTop: 2,
  },
  examLocation: {
    fontFamily: FONTS.regular,
    marginTop: 1,
  },
});
