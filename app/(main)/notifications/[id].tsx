import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useNotificationStore } from '@/features/notifications/store';
import { Card } from '@/components/ui/Card';
import type { InboxNotification, NotificationType } from '@/types/notifications';
import { SPACING, BORDER_RADIUS, SHADOWS, FONTS } from '@/constants/theme';

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

export default function NotificationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, fontSize } = useTheme();
  const { notifications, markAsRead } = useNotificationStore();

  const [notification, setNotification] = useState<InboxNotification | null>(null);

  useEffect(() => {
    const found = notifications.find((n) => n.id === id);
    if (found) {
      setNotification(found);
      if (!found.isRead) {
        markAsRead(found.id);
      }
    }
  }, [id, notifications, markAsRead]);

  if (!notification) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { paddingTop: insets.top, backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const icon = TYPE_ICONS[notification.type];
  const typeLabel = TYPE_LABELS[notification.type];
  const isHighPriority =
    notification.priority === 'high' || notification.priority === 'urgent';

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
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: colors.surfaceAlt }]}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text
          style={[
            styles.headerTitle,
            { color: colors.text, fontSize: fontSize.lg },
          ]}
        >
          Notification
        </Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Type badge */}
        <View style={styles.badgeRow}>
          <View
            style={[
              styles.typeBadge,
              {
                backgroundColor: isHighPriority
                  ? colors.errorLight
                  : colors.surfaceAlt,
              },
            ]}
          >
            <Ionicons
              name={icon}
              size={14}
              color={isHighPriority ? colors.error : colors.textSecondary}
            />
            <Text
              style={[
                styles.typeText,
                {
                  color: isHighPriority ? colors.error : colors.textSecondary,
                  fontSize: fontSize.xs,
                },
              ]}
            >
              {typeLabel}
              {isHighPriority ? ' — High Priority' : ''}
            </Text>
          </View>
        </View>

        {/* Content card */}
        <Card style={styles.contentCard}>
          <Text
            style={[
              styles.title,
              { color: colors.text, fontSize: fontSize.lg },
            ]}
          >
            {notification.title}
          </Text>
          <Text
            style={[
              styles.timestamp,
              { color: colors.textSecondary, fontSize: fontSize.xs },
            ]}
          >
            {new Date(notification.createdAt).toLocaleString()}
          </Text>
          <View
            style={[styles.divider, { backgroundColor: colors.borderLight }]}
          />
          <Text
            style={[
              styles.body,
              { color: colors.text, fontSize: fontSize.sm },
            ]}
          >
            {notification.body}
          </Text>
        </Card>

        <View style={{ height: insets.bottom + SPACING.xxl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: FONTS.bold,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: BORDER_RADIUS.full,
    gap: SPACING.xs,
  },
  typeText: {
    fontFamily: FONTS.semiBold,
  },
  contentCard: {
    padding: SPACING.lg,
  },
  title: {
    fontFamily: FONTS.bold,
    marginBottom: SPACING.xs,
  },
  timestamp: {
    fontFamily: FONTS.regular,
    marginBottom: SPACING.md,
  },
  divider: {
    height: 1,
    marginBottom: SPACING.md,
  },
  body: {
    fontFamily: FONTS.regular,
    lineHeight: 24,
  },
});
