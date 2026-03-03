import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { useTheme } from '@/hooks/useTheme';
import { useNotificationStore } from '@/features/notifications/store';
import { useAuthStore } from '@/features/auth/store';
import { Permission } from '@/types/rbac';
import type { NotificationPriority, CreateAnnouncementRequest } from '@/types/notifications';
import { SPACING, BORDER_RADIUS, FONTS } from '@/constants/theme';

const PRIORITY_OPTIONS: { label: string; value: NotificationPriority; icon: keyof typeof Ionicons.glyphMap }[] = [
  { label: 'Normal', value: 'normal', icon: 'remove-circle-outline' },
  { label: 'High', value: 'high', icon: 'alert-circle-outline' },
  { label: 'Urgent', value: 'urgent', icon: 'warning-outline' },
];

const TITLE_MAX = 100;
const BODY_MAX = 2000;

interface AnnouncementComposerProps {
  onSuccess?: () => void;
}

export function AnnouncementComposer({ onSuccess }: AnnouncementComposerProps) {
  const { colors, fontSize } = useTheme();
  const { createAnnouncement, isLoadingAnnouncements } = useNotificationStore();
  const { checkPermission } = useAuthStore();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [priority, setPriority] = useState<NotificationPriority>('normal');

  const canSendAll = checkPermission(Permission.COMM_SEND_ANNOUNCEMENT_ALL);

  function validate(): string | null {
    const trimmedTitle = title.trim();
    const trimmedBody = body.trim();
    if (!trimmedTitle) return 'Title is required.';
    if (trimmedTitle.length > TITLE_MAX)
      return `Title must be ${TITLE_MAX} characters or less.`;
    if (!trimmedBody) return 'Message body is required.';
    if (trimmedBody.length > BODY_MAX)
      return `Message must be ${BODY_MAX} characters or less.`;
    return null;
  }

  async function handleSend() {
    const error = validate();
    if (error) {
      Alert.alert('Validation Error', error);
      return;
    }

    Alert.alert(
      'Send Announcement',
      `This will send a notification to all users. Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          style: 'default',
          onPress: async () => {
            const req: CreateAnnouncementRequest = {
              title: title.trim(),
              body: body.trim(),
              priority,
              recipients: 'all',
            };

            const success = await createAnnouncement(req);
            if (success) {
              setTitle('');
              setBody('');
              setPriority('normal');
              Alert.alert('Sent', 'Announcement has been published.');
              onSuccess?.();
            }
          },
        },
      ]
    );
  }

  if (!canSendAll) {
    return (
      <Card style={styles.card}>
        <View style={styles.noPermission}>
          <Ionicons name="lock-closed-outline" size={24} color={colors.textSecondary} />
          <Text style={[styles.noPermissionText, { color: colors.textSecondary, fontSize: fontSize.sm }]}>
            You do not have permission to send announcements.
          </Text>
        </View>
      </Card>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Card style={styles.card}>
        {/* Title input */}
        <Text style={[styles.label, { color: colors.text, fontSize: fontSize.sm }]}>
          Title
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.inputBackground,
              color: colors.text,
              borderColor: colors.border,
              fontSize: fontSize.sm,
            },
          ]}
          placeholder="Announcement title"
          placeholderTextColor={colors.textSecondary}
          value={title}
          onChangeText={setTitle}
          maxLength={TITLE_MAX}
        />
        <Text style={[styles.counter, { color: colors.textSecondary, fontSize: fontSize.xs }]}>
          {title.length}/{TITLE_MAX}
        </Text>

        {/* Body input */}
        <Text style={[styles.label, { color: colors.text, fontSize: fontSize.sm }]}>
          Message
        </Text>
        <TextInput
          style={[
            styles.textArea,
            {
              backgroundColor: colors.inputBackground,
              color: colors.text,
              borderColor: colors.border,
              fontSize: fontSize.sm,
            },
          ]}
          placeholder="Write your announcement..."
          placeholderTextColor={colors.textSecondary}
          value={body}
          onChangeText={setBody}
          maxLength={BODY_MAX}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />
        <Text style={[styles.counter, { color: colors.textSecondary, fontSize: fontSize.xs }]}>
          {body.length}/{BODY_MAX}
        </Text>

        {/* Priority selector */}
        <Text style={[styles.label, { color: colors.text, fontSize: fontSize.sm }]}>
          Priority
        </Text>
        <View style={styles.priorityRow}>
          {PRIORITY_OPTIONS.map((opt) => {
            const active = priority === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.priorityChip,
                  {
                    backgroundColor: active ? colors.primary : colors.surfaceAlt,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setPriority(opt.value)}
              >
                <Ionicons
                  name={opt.icon}
                  size={14}
                  color={active ? colors.textLight : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.priorityText,
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

        {/* Send button */}
        <TouchableOpacity
          style={[
            styles.sendButton,
            {
              backgroundColor: colors.primary,
              opacity: isLoadingAnnouncements ? 0.7 : 1,
            },
          ]}
          onPress={handleSend}
          disabled={isLoadingAnnouncements}
        >
          {isLoadingAnnouncements ? (
            <ActivityIndicator color={colors.textLight} size="small" />
          ) : (
            <>
              <Ionicons name="send" size={18} color={colors.textLight} />
              <Text style={[styles.sendText, { color: colors.textLight, fontSize: fontSize.sm }]}>
                Send to All Users
              </Text>
            </>
          )}
        </TouchableOpacity>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: SPACING.lg,
  },
  label: {
    fontFamily: FONTS.semiBold,
    marginBottom: SPACING.xs,
    marginTop: SPACING.md,
  },
  input: {
    fontFamily: FONTS.regular,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
  },
  textArea: {
    fontFamily: FONTS.regular,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    minHeight: 120,
  },
  counter: {
    fontFamily: FONTS.regular,
    textAlign: 'right',
    marginTop: SPACING.xs,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  priorityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.pill,
    borderWidth: 1,
  },
  priorityText: {
    fontFamily: FONTS.semiBold,
  },
  sendButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    marginTop: SPACING.lg,
  },
  sendText: {
    fontFamily: FONTS.semiBold,
  },
  noPermission: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  noPermissionText: {
    fontFamily: FONTS.regular,
    textAlign: 'center',
  },
});
