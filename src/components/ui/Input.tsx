import { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  type TextInputProps,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONTS } from '@/constants/theme';

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

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrapper, error && styles.inputError]}>
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={COLORS.textSecondary}
          secureTextEntry={isSecure}
          autoCapitalize="none"
          {...props}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setIsSecure(!isSecure)}
            style={styles.toggle}
          >
            <Text style={styles.toggleText}>
              {isSecure ? 'Show' : 'Hide'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBackground,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: SPACING.md,
    fontSize: FONT_SIZE.md,
    fontFamily: FONTS.regular,
    color: COLORS.text,
  },
  toggle: {
    paddingHorizontal: SPACING.md,
  },
  toggleText: {
    color: COLORS.secondary,
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.semiBold,
  },
  error: {
    color: COLORS.error,
    fontSize: FONT_SIZE.xs,
    fontFamily: FONTS.regular,
    marginTop: SPACING.xs,
  },
});
