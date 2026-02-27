import { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { CourseContentItem } from '@/components/courses/CourseContentItem';
import { useCoursesStore } from '@/features/courses/store';
import { useTheme } from '@/hooks/useTheme';
import {
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
  FONTS,
} from '@/constants/theme';

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { selectedCourse, isLoadingDetail, fetchCourseDetail, clearSelectedCourse } = useCoursesStore();
  const { colors, fontSize } = useTheme();

  useEffect(() => {
    if (id) fetchCourseDetail(id);
    return () => clearSelectedCourse();
  }, [id, fetchCourseDetail, clearSelectedCourse]);

  if (isLoadingDetail || !selectedCourse) {
    return <LoadingScreen />;
  }

  const { course, progress, sections, deadlines } = selectedCourse;

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.surface }]}>
      {/* Header with back button */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.borderLight }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: colors.surfaceAlt }]}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={[styles.courseCode, { color: colors.secondary, fontSize: fontSize.xs }]}>
            {course.code}
          </Text>
          <Text style={[styles.courseName, { color: colors.text, fontSize: fontSize.lg }]} numberOfLines={2}>
            {course.name}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Course Info */}
        <Card style={styles.infoCard}>
          <Text style={[styles.instructor, { color: colors.textSecondary, fontSize: fontSize.sm }]}>
            <Ionicons name="person-outline" size={14} color={colors.textSecondary} />{' '}
            {course.instructor}
          </Text>
          <Text style={[styles.description, { color: colors.text, fontSize: fontSize.sm }]}>
            {course.description}
          </Text>
        </Card>

        {/* Progress */}
        <Card style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressTitle, { color: colors.text, fontSize: fontSize.md }]}>
              Progress
            </Text>
            <Text style={[styles.progressPercent, { color: colors.secondary, fontSize: fontSize.md }]}>
              {progress.percentage}%
            </Text>
          </View>
          <ProgressBar progress={progress.percentage} height={10} />
          <Text style={[styles.progressDetail, { color: colors.textSecondary, fontSize: fontSize.xs }]}>
            {progress.completedBlocks} of {progress.totalBlocks} items completed
          </Text>
        </Card>

        {/* Deadlines */}
        {deadlines.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fontSize.lg }]}>
              Upcoming Deadlines
            </Text>
            <Card>
              {deadlines.map((deadline) => (
                <View key={deadline.id} style={styles.deadlineRow}>
                  <Badge
                    label={deadline.type}
                    variant={deadline.type === 'exam' ? 'error' : deadline.type === 'quiz' ? 'warning' : 'info'}
                  />
                  <Text style={[styles.deadlineTitle, { color: colors.text, fontSize: fontSize.sm }]}>
                    {deadline.title}
                  </Text>
                  <Text style={[styles.deadlineDate, { color: colors.textSecondary, fontSize: fontSize.xs }]}>
                    {new Date(deadline.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </Text>
                </View>
              ))}
            </Card>
          </View>
        )}

        {/* Content Sections */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fontSize.lg }]}>
            Course Content
          </Text>
          {sections.map((section) => (
            <Card key={section.id} style={styles.contentSection}>
              <Text style={[styles.contentSectionTitle, { color: colors.text, fontSize: fontSize.md }]}>
                {section.title}
              </Text>
              {section.blocks.map((block, index) => (
                <View key={block.id}>
                  <CourseContentItem block={block} />
                  {index < section.blocks.length - 1 && (
                    <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />
                  )}
                </View>
              ))}
            </Card>
          ))}
        </View>

        <View style={{ height: insets.bottom + SPACING.lg }} />
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
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    gap: SPACING.sm,
    ...SHADOWS.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  courseCode: {
    fontFamily: FONTS.semiBold,
  },
  courseName: {
    fontFamily: FONTS.bold,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  infoCard: {
    marginBottom: SPACING.md,
  },
  instructor: {
    fontFamily: FONTS.regular,
    marginBottom: SPACING.sm,
  },
  description: {
    fontFamily: FONTS.regular,
    lineHeight: 20,
  },
  progressCard: {
    marginBottom: SPACING.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  progressTitle: {
    fontFamily: FONTS.semiBold,
  },
  progressPercent: {
    fontFamily: FONTS.bold,
  },
  progressDetail: {
    fontFamily: FONTS.regular,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  section: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    marginBottom: SPACING.sm,
  },
  deadlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  deadlineTitle: {
    flex: 1,
    fontFamily: FONTS.regular,
  },
  deadlineDate: {
    fontFamily: FONTS.semiBold,
  },
  contentSection: {
    marginBottom: SPACING.sm,
  },
  contentSectionTitle: {
    fontFamily: FONTS.semiBold,
    marginBottom: SPACING.sm,
  },
  divider: {
    height: 1,
  },
});
