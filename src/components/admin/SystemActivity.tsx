import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SPACING, FONTS, BORDER_RADIUS } from '@/constants/theme';
import type { SystemActivity as SystemActivityType, AdminLog } from '@/types/admin';

interface SystemActivityProps {
  activity: SystemActivityType[];
  logs: AdminLog[];
}

const ACTIVITY_CONFIG: Record<string, { icon: keyof typeof Ionicons.glyphMap; colorKey: 'success' | 'error' | 'warning' | 'info' }> = {
  login_success: { icon: 'log-in-outline', colorKey: 'success' },
  login_failure: { icon: 'alert-circle-outline', colorKey: 'error' },
  logout: { icon: 'log-out-outline', colorKey: 'info' },
  session_expired: { icon: 'time-outline', colorKey: 'warning' },
};

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatActivityType(type: string): string {
  return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function SystemActivitySection({ activity, logs }: SystemActivityProps) {
  const { colors, fontSize } = useTheme();

  return (
    <View>
      {/* System Activity */}
      <SectionHeader title="Recent System Activity" />
      <Card>
        {activity.map((event, index) => {
          const config = ACTIVITY_CONFIG[event.type] ?? { icon: 'ellipse-outline', colorKey: 'info' as const };
          return (
            <View
              key={event.id}
              style={[
                styles.row,
                index < activity.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.borderLight },
              ]}
            >
              <View style={[styles.iconContainer, { backgroundColor: colors[`${config.colorKey}Light`] }]}>
                <Ionicons name={config.icon} size={18} color={colors[config.colorKey]} />
              </View>
              <View style={styles.content}>
                <Text style={[styles.eventType, { color: colors.text, fontSize: fontSize.sm }]}>
                  {formatActivityType(event.type)}
                </Text>
                <Text style={[styles.eventEmail, { color: colors.textSecondary, fontSize: fontSize.xs }]}>
                  {event.email}
                </Text>
                {event.details && (
                  <Text style={[styles.eventDetail, { color: colors.textSecondary, fontSize: fontSize.xs }]}>
                    {event.details}
                  </Text>
                )}
              </View>
              <Text style={[styles.timestamp, { color: colors.textSecondary, fontSize: fontSize.xs }]}>
                {formatDateTime(event.timestamp)}
              </Text>
            </View>
          );
        })}
      </Card>

      {/* Admin Action Logs */}
      <View style={styles.section}>
        <SectionHeader title="Admin Action Log" />
        <Card>
          {logs.map((log, index) => (
            <View
              key={log.id}
              style={[
                styles.row,
                index < logs.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.borderLight },
              ]}
            >
              <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="shield-checkmark-outline" size={18} color={colors.primary} />
              </View>
              <View style={styles.content}>
                <Text style={[styles.eventType, { color: colors.text, fontSize: fontSize.sm }]}>
                  {log.action}
                </Text>
                {log.targetEmail && (
                  <Text style={[styles.eventEmail, { color: colors.textSecondary, fontSize: fontSize.xs }]}>
                    Target: {log.targetEmail}
                  </Text>
                )}
                {log.details && (
                  <Text style={[styles.eventDetail, { color: colors.textSecondary, fontSize: fontSize.xs }]}>
                    {log.details}
                  </Text>
                )}
              </View>
              <Text style={[styles.timestamp, { color: colors.textSecondary, fontSize: fontSize.xs }]}>
                {formatDateTime(log.timestamp)}
              </Text>
            </View>
          ))}

          {logs.length === 0 && (
            <View style={styles.emptyRow}>
              <Text style={[styles.emptyText, { color: colors.textSecondary, fontSize: fontSize.sm }]}>
                No admin actions recorded yet
              </Text>
            </View>
          )}
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: SPACING.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  eventType: {
    fontFamily: FONTS.semiBold,
  },
  eventEmail: {
    fontFamily: FONTS.regular,
    marginTop: 2,
  },
  eventDetail: {
    fontFamily: FONTS.regular,
    marginTop: 1,
    fontStyle: 'italic',
  },
  timestamp: {
    fontFamily: FONTS.regular,
    marginTop: 2,
  },
  emptyRow: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: FONTS.regular,
  },
});
