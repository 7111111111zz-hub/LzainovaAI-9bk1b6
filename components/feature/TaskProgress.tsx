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
import type { AgentTask, TaskStep } from '@/contexts/AgentContext';
import type { StepStatus } from '@/constants/config';

interface TaskProgressProps {
  task: AgentTask;
  onViewDetails?: (step: TaskStep) => void;
  compact?: boolean;
}

const STATUS_CONFIG: Record<StepStatus, {
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  color: string;
  bg: string;
  label: string;
}> = {
  pending: { icon: 'radio-button-unchecked', color: Colors.textMuted, bg: Colors.bgField, label: 'Pending' },
  running: { icon: 'radio-button-checked', color: Colors.running, bg: Colors.running + '20', label: 'Running...' },
  done: { icon: 'check-circle', color: Colors.success, bg: Colors.successBg, label: 'Done' },
  failed: { icon: 'cancel', color: Colors.error, bg: Colors.errorBg, label: 'Failed' },
  skipped: { icon: 'skip-next', color: Colors.warning, bg: Colors.warningBg, label: 'Skipped' },
};

export const TaskProgress = memo(function TaskProgress({
  task,
  onViewDetails,
  compact = false,
}: TaskProgressProps) {
  const doneCount = task.steps.filter(s => s.status === 'done').length;
  const totalCount = task.steps.length;
  const progress = totalCount > 0 ? doneCount / totalCount : 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={[
            styles.statusDot,
            task.status === 'running' && styles.dotRunning,
            task.status === 'done' && styles.dotDone,
            task.status === 'failed' && styles.dotFailed,
          ]} />
          <Text style={styles.title} numberOfLines={2}>{task.title}</Text>
        </View>
        <Text style={styles.counter}>{doneCount}/{totalCount}</Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` as `${number}%` }]} />
      </View>

      {/* Steps */}
      {!compact && (
        <View style={styles.steps}>
          {task.steps.map((step, idx) => {
            const config = STATUS_CONFIG[step.status];
            const isLast = idx === task.steps.length - 1;

            return (
              <Pressable
                key={step.id}
                onPress={() => step.details || step.output ? onViewDetails?.(step) : undefined}
                style={({ pressed }) => [
                  styles.stepRow,
                  pressed && (step.details || step.output) && styles.pressed,
                ]}
              >
                {/* Connector line */}
                {!isLast && (
                  <View style={[
                    styles.connectorLine,
                    step.status === 'done' && styles.connectorDone,
                  ]} />
                )}

                {/* Step icon */}
                <View style={[styles.stepIconWrapper, { backgroundColor: config.bg }]}>
                  <MaterialIcons name={config.icon} size={16} color={config.color} />
                </View>

                {/* Step info */}
                <View style={styles.stepInfo}>
                  <Text style={[styles.stepName, step.status === 'running' && styles.stepNameRunning]}>
                    {step.name}
                  </Text>
                  {step.status === 'running' && (
                    <Text style={styles.stepRunningLabel}>{config.label}</Text>
                  )}
                  {step.status === 'failed' && step.error && (
                    <Text style={styles.stepError} numberOfLines={1}>{step.error}</Text>
                  )}
                  {step.output && step.status === 'done' && !step.error && (
                    <Text style={styles.stepOutput} numberOfLines={1}>{step.output}</Text>
                  )}
                </View>

                {/* Duration */}
                {step.endTime && step.startTime && (
                  <Text style={styles.duration}>
                    {((step.endTime.getTime() - step.startTime.getTime()) / 1000).toFixed(1)}s
                  </Text>
                )}
              </Pressable>
            );
          })}
        </View>
      )}

      {/* Recent logs preview */}
      {!compact && task.logs.length > 0 && (
        <View style={styles.logsPreview}>
          <View style={styles.logsHeader}>
            <MaterialIcons name="terminal" size={12} color={Colors.textSecondary} />
            <Text style={styles.logsTitle}>Logs</Text>
          </View>
          <ScrollView
            style={styles.logsScroll}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
          >
            {task.logs.slice(-6).map(log => (
              <View key={log.id} style={styles.logEntry}>
                <View style={[
                  styles.logDot,
                  log.level === 'error' && styles.logDotError,
                  log.level === 'success' && styles.logDotSuccess,
                  log.level === 'warn' && styles.logDotWarn,
                  log.level === 'command' && styles.logDotCommand,
                ]} />
                <Text style={[
                  styles.logText,
                  log.level === 'error' && styles.logError,
                  log.level === 'success' && styles.logSuccess,
                  log.level === 'warn' && styles.logWarn,
                  log.level === 'command' && styles.logCommand,
                ]} numberOfLines={2}>
                  {log.message}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.textMuted,
    flexShrink: 0,
  },
  dotRunning: { backgroundColor: Colors.running },
  dotDone: { backgroundColor: Colors.success },
  dotFailed: { backgroundColor: Colors.error },
  title: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    flex: 1,
    includeFontPadding: false,
  },
  counter: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
    includeFontPadding: false,
  },
  progressTrack: {
    height: 4,
    backgroundColor: Colors.bgField,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
  },
  steps: {
    gap: 0,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    position: 'relative',
    paddingLeft: 4,
  },
  connectorLine: {
    position: 'absolute',
    left: 4 + 11,
    top: Spacing.sm + 20,
    width: 2,
    bottom: 0,
    backgroundColor: Colors.border,
  },
  connectorDone: {
    backgroundColor: Colors.success + '55',
  },
  stepIconWrapper: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    zIndex: 1,
  },
  stepInfo: {
    flex: 1,
    gap: 2,
  },
  stepName: {
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    fontWeight: FontWeight.medium,
    includeFontPadding: false,
  },
  stepNameRunning: {
    color: Colors.running,
  },
  stepRunningLabel: {
    fontSize: FontSize.xs,
    color: Colors.running,
    includeFontPadding: false,
  },
  stepError: {
    fontSize: FontSize.xs,
    color: Colors.error,
    includeFontPadding: false,
  },
  stepOutput: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    includeFontPadding: false,
  },
  duration: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    alignSelf: 'center',
    includeFontPadding: false,
  },
  pressed: {
    opacity: 0.75,
  },

  // Logs
  logsPreview: {
    backgroundColor: Colors.bg,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
    maxHeight: 140,
  },
  logsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  logsTitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
    includeFontPadding: false,
  },
  logsScroll: {
    flex: 1,
  },
  logEntry: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingVertical: 2,
  },
  logDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.textMuted,
    marginTop: 4,
    flexShrink: 0,
  },
  logDotError: { backgroundColor: Colors.error },
  logDotSuccess: { backgroundColor: Colors.success },
  logDotWarn: { backgroundColor: Colors.warning },
  logDotCommand: { backgroundColor: Colors.primary },
  logText: {
    fontSize: 11,
    color: Colors.textSecondary,
    flex: 1,
    fontFamily: 'monospace',
    lineHeight: 16,
    includeFontPadding: false,
  },
  logError: { color: Colors.error },
  logSuccess: { color: Colors.success },
  logWarn: { color: Colors.warning },
  logCommand: { color: Colors.primary },
});
