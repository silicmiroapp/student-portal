import { View, Text, Image, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { FONTS, SHADOWS } from '@/constants/theme';

interface AvatarProps {
  name: string;
  imageUrl?: string;
  size?: number;
}

export function Avatar({ name, imageUrl, size = 44 }: AvatarProps) {
  const { colors } = useTheme();
  const letter = name.charAt(0).toUpperCase() || 'U';
  const fontSize = size * 0.4;

  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={[
          styles.image,
          { width: size, height: size, borderRadius: size / 2, borderColor: colors.textLight },
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.primary,
          borderColor: colors.textLight,
        },
      ]}
    >
      <Text style={[styles.letter, { fontSize, color: colors.textLight }]}>{letter}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    ...SHADOWS.sm,
  },
  letter: {
    fontFamily: FONTS.bold,
  },
  image: {
    resizeMode: 'cover',
    borderWidth: 2,
    ...SHADOWS.sm,
  },
});
