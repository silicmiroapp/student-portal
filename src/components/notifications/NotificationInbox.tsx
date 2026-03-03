import { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { InboxNotification, NotificationType } from '@/types/notifications';
import { useTheme } from '@/hooks/useTheme';
import { useNotificationStore } from '@/features/notifications/store';
import { NotificationItem } from './NotificationItem';
import { EmptyState } from '@/components/ui/EmptyState';
import { SPACING, FONTS } from '@/constants/theme';

const FILTER_OPTIONS: { label: string; value: NotificationType | null }[] = [
  { label: 'All', value: null },
  { label: 'Finance', value: 'finance' },
  { label: 'Grades', value: 'grades' },
  { label: 'Announcements', value: 'announcement' },
];

export function NotificationInbox() {
  const router = useRouter();
  const { colors, fontSize } = useTheme();
  const {
    notifications,
    unreadCount,
    isLoading,
    isLoadingMore,
    hasMore,
    filter,
    fetchNotifications,
    fetchMore,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    setFilter,
  } = useNotificationStore();

  const handlePress = useCallback(
    (notification: InboxNotification) => {
      if (!notification.isRead) {
        markAsRead(notification.id);
      }
      if (notification.deepLink) {
        router.push(notification.deepLink as any);
      }
    },
    [markAsRead, router]
  );

  const handleRefresh = useCallback(() => {
    fetchNotifications(true);
  }, [fetchNotifications]);

  const renderItem = useCallback(
    ({ item }: { item: InboxNotification }) => (
      <NotificationItem
        notification={item}
        onPress={handlePress}
        onDismiss={dismissNotification}
      />
    ),
    [handlePress, dismissNotification]
  );

  const keyExtractor = useCallback((item: InboxNotification) => item.id, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Filter row + Mark all read */}
      <View
        style={[
          styles.filterRow,
          { borderBottomColor: colors.borderLight },
        ]}
      >
        <View style={styles.filters}>
          {FILTER_OPTIONS.map((opt) => {
            const active = filter === opt.value;
            return (
              <TouchableOpacity
                key={opt.label}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: active
                      ? colors.primary
                      : colors.surfaceAlt,
                  },
                ]}
                onPress={() => setFilter(opt.value)}
              >
                <Text
                  style={[
                    styles.filterText,
                    {
                      color: active ? colors.textLight : colors.textSecondary,
                      fontSize: fontSize.xs,
                    },
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text
              style={[
                styles.markAllRead,
                { color: colors.primary, fontSize: fontSize.xs },
              ]}
            >
              Mark all read
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Notification list */}
      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        onEndReached={() => {
          if (hasMore && !isLoadingMore) fetchMore();
        }}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          isLoading ? null : (
            <EmptyState
              icon="notifications-off-outline"
              title="No notifications"
              message={
                filter
                  ? 'No notifications in this category.'
                  : "You're all caught up!"
              }
            />
          )
        }
        ListFooterComponent={
          isLoadingMore ? (
            <View style={styles.footer}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : null
        }
        contentContainerStyle={
          notifications.length === 0 ? styles.emptyList : undefined
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
  },
  filters: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: 16,
  },
  filterText: {
    fontFamily: FONTS.semiBold,
  },
  markAllRead: {
    fontFamily: FONTS.semiBold,
  },
  footer: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  emptyList: {
    flexGrow: 1,
  },
});
