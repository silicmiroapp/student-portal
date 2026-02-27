import { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  type TextInputProps,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { SPACING, BORDER_RADIUS, FONTS } from '@/constants/theme';

interface InputProps extends Omit<TextInputProps, 'onChange'> {
  label: string;
  error?: string;
  isPassword?: boolean;
  onChangeText?: (text: string) => void;
}

export function Input({
  label,
  error,
  isPassword = false,
  style,
  ...props
}: InputProps) {
  const [isSecure, setIsSecure] = useState(isPassword);
  const { colors, fontSize } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text, fontSize: fontSize.sm }]}>{label}</Text>
      <View
        style={[
          styles.inputWrapper,
          { backgroundColor: colors.inputBackground, borderColor: colors.border },
          error && { borderColor: colors.error },
        ]}
      >
        <TextInput
          style={[styles.input, { color: colors.text, fontSize: fontSize.md }, style]}
          placeholderTextColor={colors.textSecondary}
          secureTextEntry={isSecure}
          autoCapitalize="none"
          {...props}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setIsSecure(!isSecure)}
            style={styles.toggle}
          >
            <Text style={[styles.toggleText, { color: colors.secondary, fontSize: fontSize.sm }]}>
              {isSecure ? 'Show' : 'Hide'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text style={[styles.error, { color: colors.error, fontSize: fontSize.xs }]}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontFamily: FONTS.semiBold,
    marginBottom: SPACING.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: SPACING.md,
    fontFamily: FONTS.regular,
  },
  toggle: {
    paddingHorizontal: SPACING.md,
  },
  toggleText: {
    fontFamily: FONTS.semiBold,
  },
  error: {
    fontFamily: FONTS.regular,
    marginTop: SPACING.xs,
  },
});
