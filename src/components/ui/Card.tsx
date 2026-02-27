import { View, StyleSheet, TouchableOpacity, type ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { SPACING, BORDER_RADIUS, SHADOWS } from '@/constants/theme';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}

export function Card({ children, onPress, style }: CardProps) {
  const { colors } = useTheme();
  const cardStyle = [
    styles.card,
    { backgroundColor: colors.background, borderColor: colors.borderLight },
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity style={cardStyle} onPress={onPress} activeOpacity={0.7}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    ...SHADOWS.sm,
  },
});
