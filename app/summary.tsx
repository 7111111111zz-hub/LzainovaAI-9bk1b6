import React, { useState } from 'react';
import {
  View, Text, Pressable, StyleSheet, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { useAgent } from '@/hooks/useAgent';
import { useApp } from '@/hooks/useApp';
import type { TaskStep } from '@/contexts/AgentContext';

export default function SummaryScreen() {
  const router = useRouter();
  const { t } = useApp();
  const { tasks, activeTask } = useAgent();
  const [expandedStepId, setExpandedStepId] = useState<string | null>(null);

  const task = activeTask || tasks[0];

  if (!task) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.closeBtn}>
            <MaterialIcons name="close" size={22} color={Colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>{t('summary')}</Text>
        </View>
        <View style={styles.emptyState}>
          <MaterialIcons name="summarize" size={48} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>No task to summarize</Text>
        </View>
      </SafeAreaView>
    );
  }

  const getStepColor = (step: TaskStep) => {
    switch (step.status) {
      case 'done': return Colors.success;
      case 'running': return Colors.running;
      case 'failed': return Colors.error;
      case 'skipped': return Colors.warning;
      default: return Colors.textMuted;
    }
  };

  const getStepIcon = (step: TaskStep): React.ComponentProps<typeof MaterialIcons>['name'] => {
    switch (step.status) {
      case 'done': return 'check-circle';
      case 'running': return 'radio-button-checked';
      case 'failed': return 'cancel';
      case 'skipped': return 'skip-next';
      default: return 'radio-button-unchecked';
    }
  };

  const doneCount = task.steps.filter(s => s.status === 'done').length;
  const progress = task.steps.length > 0 ? doneCount / task.steps.length : 0;
  const totalDuration = task.completedAt && task.startedAt
    ? Math.round((task.completedAt.getTime() - task.startedAt.getTime()) / 1000)
    : null;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <MaterialIcons name="close" size={22} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>{t('summary')}</Text>
        <View style={styles.headerRight}>
          {task.status === 'done' && (
            <View style={styles.doneChip}>
              <MaterialIcons name="check-circle" size={14} color={Colors.success} />
              <Text style={styles.doneChipText}>Complete</Text>
            </View>
          )}
          {task.status === 'failed' && (
            <View style={styles.failedChip}>
              <MaterialIcons name="cancel" size={14} color={Colors.error} />
              <Text style={styles.failedChipText}>Failed</Text>
            </View>
          )}
          {task.status === 'running' && (
            <View style={styles.runningChip}>
              <View style={styles.runningDot} />
              <Text style={styles.runningChipText}>Running</Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView style={styles.flex} showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>

        {/* Task title & description */}
        <View style={styles.titleSection}>
          <Text style={styles.taskTitle}>{task.title}</Text>
          <Text style={styles.taskDesc}>{task.description}</Text>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statBlock}>
            <Text style={styles.statValue}>{doneCount}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBlock}>
            <Text style={styles.statValue}>{task.steps.length}</Text>
            <Text style={styles.statLabel}>Total Steps</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBlock}>
            <Text style={styles.statValue}>{task.logs.length}</Text>
            <Text style={styles.statLabel}>Log Entries</Text>
          </View>
          {totalDuration !== null && (
            <>
              <View style={styles.statDivider} />
              <View style={styles.statBlock}>
                <Text style={styles.statValue}>{totalDuration}s</Text>
                <Text style={styles.statLabel}>Duration</Text>
              </View>
            </>
          )}
        </View>

        {/* Progress bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` as `${number}%` }]} />
          </View>
          <Text style={styles.progressLabel}>{Math.round(progress * 100)}% complete</Text>
        </View>

        {/* Timeline */}
        <Text style={styles.sectionTitle}>{t('timeline')}</Text>
        <View style={styles.timeline}>
          {task.steps.map((step, idx) => {
            const isLast = idx === task.steps.length - 1;
            const isExpanded = expandedStepId === step.id;
            const color = getStepColor(step);

            return (
              <View key={step.id} style={styles.timelineItem}>
                {/* Connector */}
                {!isLast && (
                  <View style={[
                    styles.timelineConnector,
                    step.status === 'done' && styles.timelineConnectorDone,
                  ]} />
                )}

                {/* Step */}
                <Pressable
                  onPress={() => setExpandedStepId(isExpanded ? null : step.id)}
                  style={({ pressed }) => [styles.timelineStep, pressed && styles.pressed]}
                >
                  <View style={[styles.timelineIcon, { backgroundColor: color + '20' }]}>
                    <MaterialIcons name={getStepIcon(step)} size={16} color={color} />
                  </View>

                  <View style={styles.timelineContent}>
                    <View style={styles.timelineHeader}>
                      <Text style={[styles.timelineName, step.status === 'running' && { color: Colors.running }]}>
                        {step.name}
                      </Text>
                      {step.endTime && step.startTime && (
                        <Text style={styles.timelineDuration}>
                          {((step.endTime.getTime() - step.startTime.getTime()) / 1000).toFixed(1)}s
                        </Text>
                      )}
                      {(step.output || step.error || step.details) && (
                        <MaterialIcons
                          name={isExpanded ? 'expand-less' : 'expand-more'}
                          size={16} color={Colors.textMuted}
                        />
                      )}
                    </View>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <View style={styles.timelineDetail}>
                        {step.details && (
                          <Text style={styles.detailText}>{step.details}</Text>
                        )}
                        {step.output && (
                          <View style={styles.detailOutput}>
                            <Text style={styles.detailOutputText}>{step.output}</Text>
                          </View>
                        )}
                        {step.error && (
                          <View style={styles.detailError}>
                            <MaterialIcons name="error" size={12} color={Colors.error} />
                            <Text style={styles.detailErrorText}>{step.error}</Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                </Pressable>
              </View>
            );
          })}
        </View>

        {/* Result */}
        {task.result && (
          <View style={styles.resultSection}>
            <Text style={styles.sectionTitle}>Result</Text>
            <View style={styles.resultCard}>
              <MaterialIcons name="check-circle" size={20} color={Colors.success} />
              <Text style={styles.resultText}>{task.result}</Text>
            </View>
          </View>
        )}

        {/* Error */}
        {task.error && (
          <View style={styles.resultSection}>
            <Text style={styles.sectionTitle}>Error</Text>
            <View style={styles.errorCard}>
              <MaterialIcons name="warning" size={20} color={Colors.error} />
              <Text style={styles.errorText}>{task.error}</Text>
            </View>
          </View>
        )}

        {/* View full execution button */}
        <Pressable
          onPress={() => { router.back(); router.push('/task-execution'); }}
          style={({ pressed }) => [styles.viewFullBtn, pressed && styles.pressed]}
        >
          <MaterialIcons name="open-in-new" size={18} color={Colors.primary} />
          <Text style={styles.viewFullText}>View Full Execution</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  closeBtn: {
    width: 40, height: 40, borderRadius: 20, alignItems: 'center',
    justifyContent: 'center', backgroundColor: Colors.bgField,
    borderWidth: 1, borderColor: Colors.border, flexShrink: 0,
  },
  headerTitle: {
    flex: 1, fontSize: FontSize.lg, fontWeight: FontWeight.bold,
    color: Colors.textPrimary, includeFontPadding: false,
  },
  headerRight: { flexShrink: 0 },
  doneChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.successBg, borderRadius: Radius.full,
    paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: Colors.success + '44',
  },
  doneChipText: { fontSize: FontSize.xs, color: Colors.success, fontWeight: FontWeight.semibold, includeFontPadding: false },
  failedChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.errorBg, borderRadius: Radius.full,
    paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: Colors.error + '44',
  },
  failedChipText: { fontSize: FontSize.xs, color: Colors.error, fontWeight: FontWeight.semibold, includeFontPadding: false },
  runningChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Colors.running + '15', borderRadius: Radius.full,
    paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: Colors.running + '44',
  },
  runningDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.running },
  runningChipText: { fontSize: FontSize.xs, color: Colors.running, fontWeight: FontWeight.semibold, includeFontPadding: false },
  content: { padding: Spacing.lg, gap: Spacing.xl, paddingBottom: 40 },
  titleSection: { gap: Spacing.sm },
  taskTitle: {
    fontSize: FontSize.xxl, fontWeight: FontWeight.bold,
    color: Colors.textPrimary, lineHeight: 32, includeFontPadding: false,
  },
  taskDesc: { fontSize: FontSize.md, color: Colors.textSecondary, lineHeight: 22, includeFontPadding: false },
  statsRow: {
    flexDirection: 'row', backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border,
    padding: Spacing.lg,
  },
  statBlock: { flex: 1, alignItems: 'center', gap: 4 },
  statDivider: { width: 1, backgroundColor: Colors.border, marginHorizontal: 4 },
  statValue: {
    fontSize: FontSize.xxl, fontWeight: FontWeight.bold,
    color: Colors.textPrimary, includeFontPadding: false,
  },
  statLabel: { fontSize: FontSize.xs, color: Colors.textMuted, includeFontPadding: false },
  progressSection: { gap: Spacing.sm },
  progressTrack: {
    height: 8, backgroundColor: Colors.bgField,
    borderRadius: Radius.full, overflow: 'hidden',
  },
  progressFill: {
    height: '100%', backgroundColor: Colors.primary, borderRadius: Radius.full,
  },
  progressLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, includeFontPadding: false },
  sectionTitle: {
    fontSize: FontSize.md, fontWeight: FontWeight.semibold,
    color: Colors.textPrimary, includeFontPadding: false,
  },
  timeline: { gap: 0 },
  timelineItem: { position: 'relative' },
  timelineConnector: {
    position: 'absolute', left: 14, top: 44,
    width: 2, bottom: 0, backgroundColor: Colors.border, zIndex: 0,
  },
  timelineConnectorDone: { backgroundColor: Colors.success + '55' },
  timelineStep: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md,
    paddingVertical: Spacing.md, paddingLeft: 4, zIndex: 1,
  },
  timelineIcon: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  timelineContent: { flex: 1 },
  timelineHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  timelineName: {
    flex: 1, fontSize: FontSize.md, color: Colors.textPrimary,
    fontWeight: FontWeight.medium, includeFontPadding: false,
  },
  timelineDuration: { fontSize: FontSize.xs, color: Colors.textMuted, includeFontPadding: false },
  timelineDetail: { marginTop: Spacing.sm, gap: Spacing.sm },
  detailText: { fontSize: FontSize.sm, color: Colors.textSecondary, includeFontPadding: false },
  detailOutput: {
    backgroundColor: Colors.bg, borderRadius: Radius.sm,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.border,
  },
  detailOutputText: {
    fontSize: 12, color: Colors.textSecondary,
    fontFamily: 'monospace', includeFontPadding: false,
  },
  detailError: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 5,
    backgroundColor: Colors.errorBg, borderRadius: Radius.sm,
    padding: Spacing.sm, borderWidth: 1, borderColor: Colors.error + '33',
  },
  detailErrorText: { flex: 1, fontSize: FontSize.xs, color: Colors.error, includeFontPadding: false },
  resultSection: { gap: Spacing.md },
  resultCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md,
    backgroundColor: Colors.successBg, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.success + '44', padding: Spacing.lg,
  },
  resultText: { flex: 1, fontSize: FontSize.md, color: Colors.textPrimary, lineHeight: 22, includeFontPadding: false },
  errorCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md,
    backgroundColor: Colors.errorBg, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.error + '44', padding: Spacing.lg,
  },
  errorText: { flex: 1, fontSize: FontSize.md, color: Colors.error, lineHeight: 22, includeFontPadding: false },
  viewFullBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    borderWidth: 1, borderColor: Colors.primary + '55', borderRadius: Radius.lg,
    paddingVertical: Spacing.md, backgroundColor: Colors.primary + '10',
    minHeight: 48,
  },
  viewFullText: {
    fontSize: FontSize.md, color: Colors.primary,
    fontWeight: FontWeight.semibold, includeFontPadding: false,
  },
  emptyState: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md,
  },
  emptyTitle: { fontSize: FontSize.lg, color: Colors.textPrimary, fontWeight: FontWeight.semibold, includeFontPadding: false },
  pressed: { opacity: 0.65 },
});
