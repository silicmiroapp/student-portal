import { useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CourseCard } from '@/components/courses/CourseCard';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useCoursesStore } from '@/features/courses/store';
import { useRefreshOnFocus } from '@/hooks/useRefreshOnFocus';
import { useTheme } from '@/hooks/useTheme';
import type { Enrollment } from '@/types/courses';
import { SPACING, SHADOWS } from '@/constants/theme';

export default function CoursesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { enrollments, isLoading, fetchEnrollments } = useCoursesStore();
  const { colors } = useTheme();

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  useRefreshOnFocus(fetchEnrollments);

  const onRefresh = useCallback(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  if (isLoading && enrollments.length === 0) {
    return <LoadingScreen />;
  }

  const renderItem = ({ item }: { item: Enrollment }) => (
    <CourseCard
      enrollment={item}
      onPress={() => router.push(`/(main)/courses/${item.course.id}`)}
    />
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.surface }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.borderLight }]}>
        <SectionHeader title="My Courses" />
      </View>
      <FlatList
        data={enrollments}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.list,
          enrollments.length === 0 && styles.emptyList,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="book-outline"
            title="No Courses"
            message="You are not enrolled in any courses yet."
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    ...SHADOWS.sm,
  },
  list: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  emptyList: {
    flex: 1,
  },
});
