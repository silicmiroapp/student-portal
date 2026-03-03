import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/features/auth/store';
import { useNotificationStore } from '@/features/notifications/store';
import { useTheme } from '@/hooks/useTheme';
import { NotificationBadge } from '@/components/notifications/NotificationBadge';
import { SHADOWS } from '@/constants/theme';

export default function MainLayout() {
  const insets = useSafeAreaInsets();
  const { isAdmin } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const { colors, fontSize, fonts, reduceMotion } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surfaceAlt,
          borderTopColor: colors.borderLight,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          ...SHADOWS.sm,
        },
        tabBarLabelStyle: {
          fontSize: fontSize.xs,
          fontFamily: fonts.semiBold,
        },
        animation: reduceMotion ? 'none' : undefined,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: isAdmin ? 'Home' : 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={isAdmin ? 'home-outline' : 'grid-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="courses"
        options={{
          title: 'Courses',
          // Hide student-only tabs from admin roles
          href: isAdmin ? null : undefined,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="grades"
        options={{
          title: 'Grades',
          href: isAdmin ? null : undefined,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="school-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="finance"
        options={{
          title: 'Finance',
          href: isAdmin ? null : undefined,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="wallet-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Inbox',
          tabBarIcon: ({ color, size }) => (
            <View>
              <Ionicons name="notifications-outline" size={size} color={color} />
              {unreadCount > 0 && <NotificationBadge count={unreadCount} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: 'Admin',
          // Show admin tab only for admin-level roles
          href: isAdmin ? undefined : null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="shield-checkmark-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
