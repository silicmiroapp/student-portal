import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { SPACING, BORDER_RADIUS, SHADOWS, FONTS } from '@/constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  isLoading = false,
  disabled = false,
  style,
}: ButtonProps) {
  const { colors, fontSize } = useTheme();
  const isDisabled = disabled || isLoading;

  const variantStyles: Record<string, ViewStyle> = {
    primary: { backgroundColor: colors.primary },
    secondary: { backgroundColor: colors.secondary },
    outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary },
  };

  const textColor =
    variant === 'outline' ? colors.primary : colors.textLight;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        variantStyles[variant],
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {isLoading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.text, { color: textColor, fontSize: fontSize.md }]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: BORDER_RADIUS.pill,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    ...SHADOWS.sm,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontFamily: FONTS.semiBold,
    letterSpacing: 0.5,
  },
});
