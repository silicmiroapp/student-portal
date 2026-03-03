import { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTheme } from '@/hooks/useTheme';
import { useNotificationStore } from '@/features/notifications/store';
import { useAuthStore } from '@/features/auth/store';
import { Permission } from '@/types/rbac';
import type { Announcement, AnnouncementStatus } from '@/types/notifications';
import { SPACING, FONTS } from '@/constants/theme';

const STATUS_COLORS: Record<AnnouncementStatus, string> = {
  draft: '#6B7280',
  scheduled: '#F59E0B',
  published: '#10B981',
  cancelled: '#EF4444',
};

const STATUS_LABELS: Record<AnnouncementStatus, string> = {
  draft: 'Draft',
  scheduled: 'Scheduled',
  published: 'Published',
  cancelled: 'Cancelled',
};

export function AnnouncementList() {
  const { colors, fontSize } = useTheme();
  const {
    announcements,
    announcementStats,
    isLoadingAnnouncements,
    announcementError,
    fetchAnnouncements,
    fetchAnnouncementStats,
    cancelAnnouncement,
  } = useNotificationStore();
  const { checkPermission } = useAuthStore();

  const canManage = checkPermission(Permission.COMM_MANAGE_ANNOUNCEMENT);

  useEffect(() => {
    fetchAnnouncements();
    fetchAnnouncementStats();
  }, [fetchAnnouncements, fetchAnnouncementStats]);

  const handleCancel = useCallback(
    (id: string, title: string) => {
      Alert.alert(
        'Cancel Announcement',
        `Cancel "${title}"? This cannot be undone.`,
        [
          { text: 'Keep', style: 'cancel' },
          {
            text: 'Cancel It',
            style: 'destructive',
            onPress: () => cancelAnnouncement(id),
          },
        ]
      );
    },
    [cancelAnnouncement]
  );

  const renderItem = useCallback(
    ({ item }: { item: Announcement }) => {
      const statusColor = STATUS_COLORS[item.status];
      const canCancelItem =
        canManage && (item.status === 'scheduled' || item.status === 'draft');

      return (
        <Card style={styles.itemCard}>
          <View style={styles.itemHeader}>
            <View style={styles.itemTitleRow}>
              <Text
                style={[
                  styles.itemTitle,
                  { color: colors.text, fontSize: fontSize.sm },
                ]}
                numberOfLines={1}
              >
                {item.title}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: statusColor + '20' },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: statusColor, fontSize: 10 },
                  ]}
                >
                  {STATUS_LABELS[item.status]}
                </Text>
              </View>
            </View>
          </View>

          <Text
            style={[
              styles.itemBody,
              { color: colors.textSecondary, fontSize: fontSize.xs },
            ]}
            numberOfLines={2}
          >
            {item.body}
          </Text>

          <View style={styles.itemFooter}>
            <View style={styles.metaRow}>
              <Ionicons
                name="people-outline"
                size={12}
                color={colors.textSecondary}
              />
              <Text
                style={[
                  styles.metaText,
                  { color: colors.textSecondary, fontSize: fontSize.xs },
                ]}
              >
                {item.recipients === 'all'
                  ? `All users (${item.recipientCount ?? '—'})`
                  : `${(item.recipients as string[]).length} users`}
              </Text>
            </View>
            <Text
              style={[
                styles.metaText,
                { color: colors.textSecondary, fontSize: fontSize.xs },
              ]}
            >
              {item.publishedAt
                ? new Date(item.publishedAt).toLocaleDateString()
                : item.scheduledAt
                  ? `Scheduled: ${new Date(item.scheduledAt).toLocaleDateString()}`
                  : new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>

          {canCancelItem && (
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: colors.border }]}
              onPress={() => handleCancel(item.id, item.title)}
            >
              <Ionicons name="close-circle-outline" size={14} color={colors.error} />
              <Text
                style={[
                  styles.cancelText,
                  { color: colors.error, fontSize: fontSize.xs },
                ]}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          )}
        </Card>
      );
    },
    [canManage, colors, fontSize, handleCancel]
  );

  return (
    <View style={styles.container}>
      {/* Stats row */}
      {announcementStats && (
        <View style={styles.statsRow}>
          <View style={[styles.statBox, { backgroundColor: colors.surfaceAlt }]}>
            <Text style={[styles.statNumber, { color: colors.text, fontSize: fontSize.lg }]}>
              {announcementStats.totalSent}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary, fontSize: fontSize.xs }]}>
              Sent
            </Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.surfaceAlt }]}>
            <Text style={[styles.statNumber, { color: colors.success, fontSize: fontSize.lg }]}>
              {announcementStats.totalDelivered}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary, fontSize: fontSize.xs }]}>
              Delivered
            </Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.surfaceAlt }]}>
            <Text style={[styles.statNumber, { color: colors.text, fontSize: fontSize.lg }]}>
              {announcementStats.broadcastsToday}/{announcementStats.maxBroadcastsPerDay}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary, fontSize: fontSize.xs }]}>
              Today
            </Text>
          </View>
        </View>
      )}

      {/* Error */}
      {announcementError && (
        <View style={[styles.errorBanner, { backgroundColor: colors.errorLight }]}>
          <Text style={[styles.errorText, { color: colors.error, fontSize: fontSize.xs }]}>
            {announcementError}
          </Text>
        </View>
      )}

      {/* Announcement list */}
      <FlatList
        data={announcements}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={isLoadingAnnouncements}
            onRefresh={() => {
              fetchAnnouncements();
              fetchAnnouncementStats();
            }}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          isLoadingAnnouncements ? (
            <View style={styles.loading}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : (
            <EmptyState
              icon="megaphone-outline"
              title="No announcements"
              message="Create your first announcement above."
            />
          )
        }
        contentContainerStyle={
          announcements.length === 0 ? styles.emptyList : styles.listContent
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderRadius: 8,
  },
  statNumber: {
    fontFamily: FONTS.bold,
  },
  statLabel: {
    fontFamily: FONTS.regular,
    marginTop: 2,
  },
  errorBanner: {
    marginHorizontal: SPACING.lg,
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.sm,
  },
  errorText: {
    fontFamily: FONTS.regular,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  itemCard: {
    marginBottom: SPACING.md,
    padding: SPACING.md,
  },
  itemHeader: {
    marginBottom: SPACING.xs,
  },
  itemTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemTitle: {
    fontFamily: FONTS.semiBold,
    flex: 1,
    marginRight: SPACING.sm,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontFamily: FONTS.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  itemBody: {
    fontFamily: FONTS.regular,
    lineHeight: 18,
    marginBottom: SPACING.sm,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  metaText: {
    fontFamily: FONTS.regular,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    alignSelf: 'flex-start',
    marginTop: SPACING.sm,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderWidth: 1,
    borderRadius: 6,
  },
  cancelText: {
    fontFamily: FONTS.semiBold,
  },
  loading: {
    paddingVertical: SPACING.xxl,
    alignItems: 'center',
  },
  emptyList: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
  },
});
