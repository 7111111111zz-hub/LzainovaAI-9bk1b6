import React, { memo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import type { Project } from '@/contexts/ProjectContext';

const PROJECT_TYPE_CONFIG = {
  android: { icon: 'android' as const, color: '#3DDC84' },
  web: { icon: 'web' as const, color: '#4285F4' },
  api: { icon: 'api' as const, color: '#FF6D00' },
  ml: { icon: 'psychology' as const, color: '#AB47BC' },
  other: { icon: 'folder' as const, color: '#78909C' },
};

interface ProjectCardProps {
  project: Project;
  onPress?: () => void;
  onLongPress?: () => void;
}

export const ProjectCard = memo(function ProjectCard({
  project,
  onPress,
  onLongPress,
}: ProjectCardProps) {
  const config = PROJECT_TYPE_CONFIG[project.type] || PROJECT_TYPE_CONFIG.other;
  const lastBuild = project.builds[0];
  const passedTests = project.tests.filter(t => t.status === 'pass').length;
  const totalTests = project.tests.length;

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
  };

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.pressed,
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.typeIcon, { backgroundColor: config.color + '20' }]}>
          <MaterialIcons name={config.icon} size={20} color={config.color} />
        </View>
        <View style={styles.titleArea}>
          <Text style={styles.name} numberOfLines={1}>{project.name}</Text>
          <Text style={styles.type}>{project.type}</Text>
        </View>
        <MaterialIcons name="chevron-right" size={20} color={Colors.textMuted} />
      </View>

      {/* Description */}
      {project.description ? (
        <Text style={styles.description} numberOfLines={2}>{project.description}</Text>
      ) : null}

      {/* Stats */}
      <View style={styles.stats}>
        <View style={styles.stat}>
          <MaterialIcons name="insert-drive-file" size={13} color={Colors.textMuted} />
          <Text style={styles.statText}>{project.files.length} files</Text>
        </View>
        {lastBuild && (
          <View style={styles.stat}>
            <View style={[
              styles.buildDot,
              lastBuild.status === 'success' && styles.buildSuccess,
              lastBuild.status === 'failed' && styles.buildFailed,
              lastBuild.status === 'running' && styles.buildRunning,
            ]} />
            <Text style={styles.statText}>
              Build {lastBuild.status === 'success' ? 'OK' : lastBuild.status === 'failed' ? 'FAIL' : '...'}
            </Text>
          </View>
        )}
        {totalTests > 0 && (
          <View style={styles.stat}>
            <MaterialIcons
              name={passedTests === totalTests ? 'check-circle' : 'warning'}
              size={13}
              color={passedTests === totalTests ? Colors.success : Colors.warning}
            />
            <Text style={styles.statText}>{passedTests}/{totalTests} tests</Text>
          </View>
        )}
        <View style={[styles.stat, styles.statRight]}>
          <Text style={styles.dateText}>{formatDate(project.updatedAt)}</Text>
        </View>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.99 }],
    borderColor: Colors.borderAccent,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  titleArea: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    includeFontPadding: false,
  },
  type: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    includeFontPadding: false,
  },
  description: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    includeFontPadding: false,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statRight: {
    marginLeft: 'auto',
  },
  statText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    includeFontPadding: false,
  },
  dateText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    includeFontPadding: false,
  },
  buildDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.textMuted,
  },
  buildSuccess: { backgroundColor: Colors.success },
  buildFailed: { backgroundColor: Colors.error },
  buildRunning: { backgroundColor: Colors.running },
});
