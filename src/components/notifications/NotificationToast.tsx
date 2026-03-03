import { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { SPACING, BORDER_RADIUS, SHADOWS, FONTS } from '@/constants/theme';
import { useNotificationStore } from '@/features/notifications/store';

const TOAST_DURATION = 4000;

export function NotificationToast() {
  const insets = useSafeAreaInsets();
  const { colors, fontSize } = useTheme();
  const { foregroundNotification, clearForegroundNotification } =
    useNotificationStore();
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (foregroundNotification) {
      // Animate in
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 12,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-dismiss
      timerRef.current = setTimeout(() => {
        dismiss();
      }, TOAST_DURATION);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [foregroundNotification]);

  function dismiss() {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      clearForegroundNotification();
    });
  }

  if (!foregroundNotification) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: insets.top + SPACING.sm,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.toast,
          {
            backgroundColor: colors.surface,
            borderColor: colors.borderLight,
          },
        ]}
        onPress={dismiss}
        activeOpacity={0.9}
      >
        <View
          style={[styles.iconCircle, { backgroundColor: colors.primaryLight }]}
        >
          <Ionicons
            name="notifications"
            size={18}
            color={colors.primary}
          />
        </View>
        <View style={styles.content}>
          <Text
            style={[styles.title, { color: colors.text, fontSize: fontSize.sm }]}
            numberOfLines={1}
          >
            {foregroundNotification.title}
          </Text>
          <Text
            style={[
              styles.body,
              { color: colors.textSecondary, fontSize: fontSize.xs },
            ]}
            numberOfLines={2}
          >
            {foregroundNotification.body}
          </Text>
        </View>
        <Ionicons name="close" size={16} color={colors.textSecondary} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: SPACING.md,
    right: SPACING.md,
    zIndex: 9999,
    ...Platform.select({
      ios: { elevation: undefined },
      android: { elevation: 10 },
      default: {},
    }),
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    ...SHADOWS.lg,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  content: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  title: {
    fontFamily: FONTS.semiBold,
    marginBottom: 2,
  },
  body: {
    fontFamily: FONTS.regular,
    lineHeight: 16,
  },
});
