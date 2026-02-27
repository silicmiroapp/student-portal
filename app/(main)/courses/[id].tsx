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
import {
  COLORS,
  SPACING,
  FONT_SIZE,
  BORDER_RADIUS,
  SHADOWS,
  FONTS,
} from '@/constants/theme';

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { selectedCourse, isLoadingDetail, fetchCourseDetail, clearSelectedCourse } = useCoursesStore();

  useEffect(() => {
    if (id) fetchCourseDetail(id);
    return () => clearSelectedCourse();
  }, [id, fetchCourseDetail, clearSelectedCourse]);

  if (isLoadingDetail || !selectedCourse) {
    return <LoadingScreen />;
  }

  const { course, progress, sections, deadlines } = selectedCourse;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.courseCode}>{course.code}</Text>
          <Text style={styles.courseName} numberOfLines={2}>{course.name}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Course Info */}
        <Card style={styles.infoCard}>
          <Text style={styles.instructor}>
            <Ionicons name="person-outline" size={14} color={COLORS.textSecondary} />{' '}
            {course.instructor}
          </Text>
          <Text style={styles.description}>{course.description}</Text>
        </Card>

        {/* Progress */}
        <Card style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Progress</Text>
            <Text style={styles.progressPercent}>{progress.percentage}%</Text>
          </View>
          <ProgressBar progress={progress.percentage} height={10} />
          <Text style={styles.progressDetail}>
            {progress.completedBlocks} of {progress.totalBlocks} items completed
          </Text>
        </Card>

        {/* Deadlines */}
        {deadlines.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upcoming Deadlines</Text>
            <Card>
              {deadlines.map((deadline) => (
                <View key={deadline.id} style={styles.deadlineRow}>
                  <Badge
                    label={deadline.type}
                    variant={deadline.type === 'exam' ? 'error' : deadline.type === 'quiz' ? 'warning' : 'info'}
                  />
                  <Text style={styles.deadlineTitle}>{deadline.title}</Text>
                  <Text style={styles.deadlineDate}>
                    {new Date(deadline.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </Text>
                </View>
              ))}
            </Card>
          </View>
        )}

        {/* Content Sections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Course Content</Text>
          {sections.map((section) => (
            <Card key={section.id} style={styles.contentSection}>
              <Text style={styles.contentSectionTitle}>{section.title}</Text>
              {section.blocks.map((block, index) => (
                <View key={block.id}>
                  <CourseContentItem block={block} />
                  {index < section.blocks.length - 1 && <View style={styles.divider} />}
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
    backgroundColor: COLORS.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    gap: SPACING.sm,
    ...SHADOWS.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  courseCode: {
    fontSize: FONT_SIZE.xs,
    fontFamily: FONTS.semiBold,
    color: COLORS.secondary,
  },
  courseName: {
    fontSize: FONT_SIZE.lg,
    fontFamily: FONTS.bold,
    color: COLORS.text,
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
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  description: {
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.regular,
    color: COLORS.text,
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
    fontSize: FONT_SIZE.md,
    fontFamily: FONTS.semiBold,
    color: COLORS.text,
  },
  progressPercent: {
    fontSize: FONT_SIZE.md,
    fontFamily: FONTS.bold,
    color: COLORS.secondary,
  },
  progressDetail: {
    fontSize: FONT_SIZE.xs,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  section: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontFamily: FONTS.bold,
    color: COLORS.text,
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
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.regular,
    color: COLORS.text,
  },
  deadlineDate: {
    fontSize: FONT_SIZE.xs,
    fontFamily: FONTS.semiBold,
    color: COLORS.textSecondary,
  },
  contentSection: {
    marginBottom: SPACING.sm,
  },
  contentSectionTitle: {
    fontSize: FONT_SIZE.md,
    fontFamily: FONTS.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
  },
});
