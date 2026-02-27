import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/features/auth/store';
import { useTheme } from '@/hooks/useTheme';
import {
  registerSchema,
  type RegisterFormData,
} from '@/features/auth/validation';
import {
  SPACING,
  BORDER_RADIUS,
  FONTS,
} from '@/constants/theme';

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { register, isLoading, error, clearError } = useAuthStore();
  const { colors, fontSize } = useTheme();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    clearError();
    await register({
      name: data.name,
      email: data.email,
      password: data.password,
    });
  };

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.container, { paddingTop: insets.top + SPACING.sm }]}>
          {/* Back button */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={[styles.backText, { color: colors.secondary, fontSize: fontSize.md }]}>
              ← Back
            </Text>
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text, fontSize: fontSize.xxl }]}>
              Create Account
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary, fontSize: fontSize.md }]}>
              Fill in the details to get started
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {error && (
              <View style={[styles.errorBanner, { backgroundColor: colors.errorLight, borderColor: colors.errorBorder }]}>
                <Text style={[styles.errorBannerText, { color: colors.error, fontSize: fontSize.sm }]}>
                  {error}
                </Text>
              </View>
            )}

            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Full Name"
                  placeholder="John Doe"
                  autoComplete="name"
                  autoCapitalize="words"
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  error={errors.name?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Email"
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  autoComplete="email"
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  error={errors.email?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Password"
                  placeholder="At least 6 characters"
                  isPassword
                  autoComplete="new-password"
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  error={errors.password?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Confirm Password"
                  placeholder="Re-enter your password"
                  isPassword
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  error={errors.confirmPassword?.message}
                />
              )}
            />

            <Button
              title="Create Account"
              onPress={handleSubmit(onSubmit)}
              isLoading={isLoading}
              style={styles.button}
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textSecondary, fontSize: fontSize.sm }]}>
              Already have an account?
            </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={[styles.footerLink, { color: colors.secondary, fontSize: fontSize.sm }]}>
                {' '}Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xxl,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: SPACING.md,
    padding: SPACING.xs,
  },
  backText: {
    fontFamily: FONTS.semiBold,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  title: {
    fontFamily: FONTS.bold,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontFamily: FONTS.regular,
  },
  form: {
    marginBottom: SPACING.xl,
  },
  errorBanner: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  errorBannerText: {
    fontFamily: FONTS.regular,
    textAlign: 'center',
  },
  button: {
    marginTop: SPACING.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontFamily: FONTS.regular,
  },
  footerLink: {
    fontFamily: FONTS.semiBold,
  },
});
