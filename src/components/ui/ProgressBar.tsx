import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { BORDER_RADIUS } from '@/constants/theme';

interface ProgressBarProps {
  progress: number; // 0–100
  color?: string;
  height?: number;
  backgroundColor?: string;
}

export function ProgressBar({
  progress,
  color,
  height = 8,
  backgroundColor,
}: ProgressBarProps) {
  const { colors } = useTheme();
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const trackBg = backgroundColor ?? colors.borderLight;
  const fillColor = color ?? colors.secondary;

  return (
    <View style={[styles.track, { height, backgroundColor: trackBg }]}>
      <View
        style={[
          styles.fill,
          {
            width: `${clampedProgress}%`,
            backgroundColor: fillColor,
            height,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: BORDER_RADIUS.full,
  },
});
