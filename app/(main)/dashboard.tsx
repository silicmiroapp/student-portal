import { useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
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
import { useRefreshOnFocus } from '@/hooks/useRefreshOnFocus';
import {
  COLORS,
  SPACING,
  FONT_SIZE,
  BORDER_RADIUS,
} from '@/constants/theme';

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuthStore();
  const { data, isLoading, fetchDashboard } = useDashboardStore();

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  useRefreshOnFocus(fetchDashboard);

  const onRefresh = useCallback(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (isLoading && !data) {
    return <LoadingScreen />;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good {getGreeting()},</Text>
          <Text style={styles.userName}>{user?.name ?? 'Student'}</Text>
          {user?.program && (
            <Text style={styles.program}>{user.program}</Text>
          )}
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
                    <Text style={styles.courseCode}>{enrollment.course.code}</Text>
                    <Text style={styles.courseName} numberOfLines={1}>
                      {enrollment.course.name}
                    </Text>
                  </View>
                  <Text style={styles.courseProgress}>{enrollment.progress}%</Text>
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
                    <View style={styles.divider} />
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
                    <View style={styles.examIconContainer}>
                      <Ionicons name="school-outline" size={18} color={COLORS.warning} />
                    </View>
                    <View style={styles.examInfo}>
                      <Text style={styles.examSubject}>{exam.subjectName}</Text>
                      <Text style={styles.examMeta}>
                        {formatDate(exam.date)} · {exam.startTime} - {exam.endTime}
                      </Text>
                      <Text style={styles.examLocation}>{exam.location}</Text>
                    </View>
                  </View>
                  {index < data.upcomingExams.length - 1 && (
                    <View style={styles.divider} />
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
    backgroundColor: COLORS.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  greeting: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  userName: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  program: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
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
    marginBottom: SPACING.lg,
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
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: COLORS.primary,
  },
  courseName: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '500',
    color: COLORS.text,
    marginTop: 2,
  },
  courseProgress: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  examRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  examIconContainer: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.warningLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  examInfo: {
    flex: 1,
  },
  examSubject: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '500',
    color: COLORS.text,
  },
  examMeta: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  examLocation: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
});
