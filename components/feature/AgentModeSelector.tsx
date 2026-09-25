import React, { memo } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { MODE_COLORS } from '@/constants/config';
import { useApp } from '@/hooks/useApp';
import type { AgentMode } from '@/constants/config';

interface ModeConfig {
  id: AgentMode;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  labelKey: 'modeChat' | 'modeCode' | 'modeTask' | 'modeVision' | 'modeMemory';
  descKey: 'modeChatDesc' | 'modeCodeDesc' | 'modeTaskDesc' | 'modeVisionDesc' | 'modeMemoryDesc';
}

const MODES: ModeConfig[] = [
  { id: 'chat', icon: 'chat-bubble-outline', labelKey: 'modeChat', descKey: 'modeChatDesc' },
  { id: 'code', icon: 'code', labelKey: 'modeCode', descKey: 'modeCodeDesc' },
  { id: 'task', icon: 'assignment', labelKey: 'modeTask', descKey: 'modeTaskDesc' },
  { id: 'vision', icon: 'visibility', labelKey: 'modeVision', descKey: 'modeVisionDesc' },
  { id: 'memory', icon: 'memory', labelKey: 'modeMemory', descKey: 'modeMemoryDesc' },
];

interface AgentModeSelectorProps {
  compact?: boolean;
}

export const AgentModeSelector = memo(function AgentModeSelector({
  compact = false,
}: AgentModeSelectorProps) {
  const { activeMode, setActiveMode, t } = useApp();

  if (compact) {
    return (
      <View style={styles.outerCompact}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollCompact}
        >
          {MODES.map(mode => {
            const isSelected = activeMode === mode.id;
            const color = MODE_COLORS[mode.id];

            return (
              <Pressable
                key={mode.id}
                onPress={() => setActiveMode(mode.id)}
                style={({ pressed }) => [
                  styles.chipBase,
                  isSelected && { backgroundColor: color + '22', borderColor: color },
                  !isSelected && styles.chipDefault,
                  pressed && styles.pressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={t(mode.labelKey)}
                accessibilityState={{ selected: isSelected }}
              >
                <MaterialIcons
                  name={mode.icon}
                  size={14}
                  color={isSelected ? color : Colors.textSecondary}
                />
                <Text style={[
                  styles.chipLabel,
                  isSelected && { color },
                  !isSelected && styles.chipLabelDefault,
                ]}>
                  {t(mode.labelKey)}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.outerFull}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollFull}
      >
        {MODES.map(mode => {
          const isSelected = activeMode === mode.id;
          const color = MODE_COLORS[mode.id];

          return (
            <Pressable
              key={mode.id}
              onPress={() => setActiveMode(mode.id)}
              style={({ pressed }) => [
                styles.cardBase,
                isSelected && { borderColor: color, backgroundColor: color + '15' },
                !isSelected && styles.cardDefault,
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`${t(mode.labelKey)}: ${t(mode.descKey)}`}
              accessibilityState={{ selected: isSelected }}
            >
              <View style={[styles.iconCircle, { backgroundColor: color + '20' }]}>
                <MaterialIcons name={mode.icon} size={20} color={color} />
              </View>
              <Text style={[styles.cardLabel, isSelected && { color }]}>
                {t(mode.labelKey)}
              </Text>
              <Text style={styles.cardDesc} numberOfLines={2}>
                {t(mode.descKey)}
              </Text>
              {isSelected && (
                <View style={[styles.activeDot, { backgroundColor: color }]} />
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  // Compact (chips)
  outerCompact: {
    minHeight: 44,
  },
  scrollCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  chipBase: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: Radius.full,
    borderWidth: 1,
    minHeight: 36,
  },
  chipDefault: {
    backgroundColor: Colors.bgField,
    borderColor: Colors.border,
  },
  chipLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    includeFontPadding: false,
  },
  chipLabelDefault: {
    color: Colors.textSecondary,
  },

  // Full cards
  outerFull: {
    minHeight: 100,
  },
  scrollFull: {
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  cardBase: {
    width: 110,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    gap: Spacing.xs,
    minHeight: 96,
  },
  cardDefault: {
    backgroundColor: Colors.bgCard,
    borderColor: Colors.border,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    includeFontPadding: false,
  },
  cardDesc: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    includeFontPadding: false,
    lineHeight: 15,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 2,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.97 }],
  },
});
