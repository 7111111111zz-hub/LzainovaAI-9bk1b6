import React, { memo } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { useApp } from '@/hooks/useApp';

interface SuggestionChipsProps {
  onSelect: (suggestion: string) => void;
}

const SUGGESTION_ICONS: React.ComponentProps<typeof MaterialIcons>['name'][] = [
  'android',
  'apps',
  'psychology',
  'code',
];

export const SuggestionChips = memo(function SuggestionChips({
  onSelect,
}: SuggestionChipsProps) {
  const { t } = useApp();

  const suggestions = [
    t('suggestion1'),
    t('suggestion2'),
    t('suggestion3'),
    t('suggestion4'),
  ];

  return (
    <View style={styles.outer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {suggestions.map((suggestion, idx) => (
          <Pressable
            key={idx}
            onPress={() => onSelect(suggestion)}
            style={({ pressed }) => [
              styles.chip,
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={suggestion}
          >
            <View style={styles.iconWrapper}>
              <MaterialIcons
                name={SUGGESTION_ICONS[idx]}
                size={14}
                color={Colors.primary}
              />
            </View>
            <Text style={styles.chipText}>{suggestion}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  outer: {
    minHeight: 50,
  },
  scroll: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.borderAccent,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 40,
  },
  iconWrapper: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
    includeFontPadding: false,
  },
  pressed: {
    opacity: 0.65,
    transform: [{ scale: 0.96 }],
    borderColor: Colors.primary,
  },
});
