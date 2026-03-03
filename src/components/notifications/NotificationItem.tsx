import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { InboxNotification, NotificationType } from '@/types/notifications';
import { useTheme } from '@/hooks/useTheme';
import { SPACING, BORDER_RADIUS, FONTS } from '@/constants/theme';

interface NotificationItemProps {
  notification: InboxNotification;
  onPress: (notification: InboxNotification) => void;
  onDismiss?: (id: string) => void;
}

const TYPE_ICONS: Record<NotificationType, keyof typeof Ionicons.glyphMap> = {
  finance: 'wallet-outline',
  grades: 'school-outline',
  announcement: 'megaphone-outline',
};

const TYPE_LABELS: Record<NotificationType, string> = {
  finance: 'Finance',
  grades: 'Grades',
  announcement: 'Announcement',
};

function getRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export function NotificationItem({
  notification,
  onPress,
  onDismiss,
}: NotificationItemProps) {
  const { colors, fontSize } = useTheme();
  const icon = TYPE_ICONS[notification.type];
  const typeLabel = TYPE_LABELS[notification.type];
  const isHighPriority =
    notification.priority === 'high' || notification.priority === 'urgent';

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: notification.isRead
            ? colors.background
            : colors.primaryLight,
          borderBottomColor: colors.borderLight,
        },
      ]}
      onPress={() => onPress(notification)}
      activeOpacity={0.7}
    >
      {/* Unread dot */}
      {!notification.isRead && (
        <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
      )}

      {/* Icon */}
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: notification.isRead
              ? colors.surfaceAlt
              : colors.background,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={20}
          color={isHighPriority ? colors.error : colors.textSecondary}
        />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text
            style={[
              styles.type,
              {
                color: isHighPriority ? colors.error : colors.textSecondary,
                fontSize: fontSize.xs,
              },
            ]}
          >
            {typeLabel}
            {isHighPriority ? ' !' : ''}
          </Text>
          <Text
            style={[
              styles.time,
              { color: colors.textSecondary, fontSize: fontSize.xs },
            ]}
          >
            {getRelativeTime(notification.createdAt)}
          </Text>
        </View>

        <Text
          style={[
            styles.title,
            {
              color: colors.text,
              fontSize: fontSize.sm,
              fontFamily: notification.isRead ? FONTS.regular : FONTS.semiBold,
            },
          ]}
          numberOfLines={1}
        >
          {notification.title}
        </Text>

        <Text
          style={[
            styles.body,
            { color: colors.textSecondary, fontSize: fontSize.xs },
          ]}
          numberOfLines={2}
        >
          {notification.body}
        </Text>
      </View>

      {/* Dismiss button */}
      {onDismiss && (
        <TouchableOpacity
          style={styles.dismissButton}
          onPress={() => onDismiss(notification.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
    left: SPACING.sm,
    top: SPACING.lg + 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  type: {
    fontFamily: FONTS.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  time: {
    fontFamily: FONTS.regular,
  },
  title: {
    marginBottom: 2,
  },
  body: {
    fontFamily: FONTS.regular,
    lineHeight: 18,
  },
  dismissButton: {
    padding: SPACING.xs,
    marginLeft: SPACING.sm,
  },
});
