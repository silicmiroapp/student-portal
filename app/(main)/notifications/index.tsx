import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useNotificationStore } from '@/features/notifications/store';
import { NotificationInbox } from '@/components/notifications/NotificationInbox';
import { SPACING, SHADOWS, FONTS } from '@/constants/theme';

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const { colors, fontSize } = useTheme();
  const { fetchNotifications, fetchUnreadCount, unreadCount } =
    useNotificationStore();

  useEffect(() => {
    fetchNotifications(true);
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, backgroundColor: colors.background },
      ]}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.borderLight,
          },
        ]}
      >
        <Text
          style={[
            styles.headerTitle,
            { color: colors.text, fontSize: fontSize.lg },
          ]}
        >
          Inbox
        </Text>
        {unreadCount > 0 && (
          <View style={[styles.countBadge, { backgroundColor: colors.primaryLight }]}>
            <Text
              style={[
                styles.countText,
                { color: colors.primary, fontSize: fontSize.xs },
              ]}
            >
              {unreadCount} unread
            </Text>
          </View>
        )}
      </View>

      {/* Inbox content */}
      <NotificationInbox />
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
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    ...SHADOWS.sm,
  },
  headerTitle: {
    fontFamily: FONTS.bold,
  },
  countBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  countText: {
    fontFamily: FONTS.semiBold,
  },
});
