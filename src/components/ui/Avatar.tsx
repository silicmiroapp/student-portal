import { View, Text, Image, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZE, BORDER_RADIUS } from '@/constants/theme';

interface AvatarProps {
  name: string;
  imageUrl?: string;
  size?: number;
}

export function Avatar({ name, imageUrl, size = 44 }: AvatarProps) {
  const letter = name.charAt(0).toUpperCase() || 'U';
  const fontSize = size * 0.4;

  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
      />
    );
  }

  return (
    <View
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Text style={[styles.letter, { fontSize }]}>{letter}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  letter: {
    fontWeight: '700',
    color: COLORS.textLight,
  },
  image: {
    resizeMode: 'cover',
  },
});
