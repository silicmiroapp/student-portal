import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { SPACING, BORDER_RADIUS, FONTS } from '@/constants/theme';

interface SegmentedControlProps<T extends string> {
  items: { label: string; value: T }[];
  selectedValue: T;
  onSelect: (value: T) => void;
}

export function SegmentedControl<T extends string>({
  items,
  selectedValue,
  onSelect,
}: SegmentedControlProps<T>) {
  const { colors, fontSize } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
      {items.map((item) => {
        const isSelected = item.value === selectedValue;
        return (
          <TouchableOpacity
            key={item.value}
            style={[
              styles.segment,
              isSelected && [styles.selectedSegment, { backgroundColor: colors.primary }],
            ]}
            onPress={() => onSelect(item.value)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.label,
                { color: colors.textSecondary, fontSize: fontSize.sm },
                isSelected && { color: colors.textLight },
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    padding: 3,
  },
  segment: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.sm,
  },
  selectedSegment: {
    borderRadius: BORDER_RADIUS.sm,
  },
  label: {
    fontFamily: FONTS.semiBold,
  },
});
