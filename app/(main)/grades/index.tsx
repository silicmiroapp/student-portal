import { useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GradeCard } from '@/components/grades/GradeCard';
import { GradeSummaryCard } from '@/components/grades/GradeSummaryCard';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useGradesStore } from '@/features/grades/store';
import { useRefreshOnFocus } from '@/hooks/useRefreshOnFocus';
import { useTheme } from '@/hooks/useTheme';
import type { Grade } from '@/types/grades';
import { SPACING, SHADOWS } from '@/constants/theme';

export default function GradesScreen() {
  const insets = useSafeAreaInsets();
  const { grades, summary, isLoading, fetchGrades } = useGradesStore();
  const { colors } = useTheme();

  useEffect(() => {
    fetchGrades();
  }, [fetchGrades]);

  useRefreshOnFocus(fetchGrades);

  const onRefresh = useCallback(() => {
    fetchGrades();
  }, [fetchGrades]);

  if (isLoading && grades.length === 0) {
    return <LoadingScreen />;
  }

  const renderItem = ({ item }: { item: Grade }) => (
    <GradeCard grade={item} />
  );

  const ListHeader = () => (
    <View>
      {summary && <GradeSummaryCard summary={summary} />}
      <SectionHeader title="All Subjects" />
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.surface }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.borderLight }]}>
        <SectionHeader title="My Grades" />
      </View>
      <FlatList
        data={grades}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={[
          styles.list,
          grades.length === 0 && styles.emptyList,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="school-outline"
            title="No Grades"
            message="Your grades will appear here once they are available."
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
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  emptyList: {
    flex: 1,
  },
});
