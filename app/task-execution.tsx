import React, { useState } from 'react';
import {
  View, Text, Pressable, StyleSheet, ScrollView, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { useAgent } from '@/hooks/useAgent';
import { useApp } from '@/hooks/useApp';
import { TaskProgress } from '@/components';
import type { TaskStep } from '@/contexts/AgentContext';

type DetailTab = 'steps' | 'logs' | 'summary';

export default function TaskExecutionScreen() {
  const router = useRouter();
  const { t } = useApp();
  const { tasks, activeTask, activeTaskId, setActiveTask } = useAgent();
  const [detailTab, setDetailTab] = useState<DetailTab>('steps');
  const [selectedStep, setSelectedStep] = useState<TaskStep | null>(null);

  const task = activeTask || tasks[0];

  if (!task) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="close" size={24} color={Colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>Task Execution</Text>
        </View>
        <View style={styles.emptyState}>
          <MaterialIcons name="assignment" size={48} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>No active tasks</Text>
          <Text style={styles.emptySubtitle}>Start a task in Chat to see it here</Text>
        </View>
      </SafeAreaView>
    );
  }

  const getStatusColor = () => {
    switch (task.status) {
      case 'running': return Colors.running;
      case 'done': return Colors.success;
      case 'failed': return Colors.error;
      case 'planning': return Colors.primary;
      default: return Colors.textMuted;
    }
  };

  const DETAIL_TABS: { id: DetailTab; label: string; icon: React.ComponentProps<typeof MaterialIcons>['name'] }[] = [
    { id: 'steps', label: t('tasks'), icon: 'list' },
    { id: 'logs', label: 'Terminal', icon: 'terminal' },
    { id: 'summary', label: t('summary'), icon: 'summarize' },
  ];

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="close" size={22} color={Colors.textPrimary} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>{task.title}</Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {task.status === 'running' ? t('taskRunning') :
               task.status === 'done' ? 'Completed' :
               task.status === 'failed' ? 'Failed' :
               task.status === 'planning' ? 'Planning...' : 'Idle'}
            </Text>
          </View>
        </View>
        {tasks.length > 1 && (
          <Pressable
            onPress={() => {
              const currentIdx = tasks.findIndex(t => t.id === task.id);
              const next = tasks[(currentIdx + 1) % tasks.length];
              setActiveTask(next.id);
            }}
            style={styles.backBtn}
          >
            <MaterialIcons name="swap-horiz" size={22} color={Colors.textSecondary} />
          </Pressable>
        )}
      </View>

      {/* Progress overview */}
      <View style={styles.progressSection}>
        <TaskProgress
          task={task}
          compact={false}
          onViewDetails={(step) => {
            setSelectedStep(step);
            setDetailTab('steps');
          }}
        />
      </View>

      {/* Detail tabs */}
      <View style={styles.detailTabs}>
        {DETAIL_TABS.map(tab => (
          <Pressable
            key={tab.id}
            onPress={() => setDetailTab(tab.id)}
            style={({ pressed }) => [
              styles.detailTab,
              detailTab === tab.id && styles.detailTabActive,
              pressed && styles.pressed,
            ]}
          >
            <MaterialIcons
              name={tab.icon}
              size={15}
              color={detailTab === tab.id ? Colors.primary : Colors.textMuted}
            />
            <Text style={[styles.detailTabText, detailTab === tab.id && styles.detailTabTextActive]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Content */}
      <View style={styles.flex}>
        {detailTab === 'steps' && (
          <ScrollView contentContainerStyle={styles.stepsContent} showsVerticalScrollIndicator={false}>
            {task.steps.map(step => (
              <Pressable
                key={step.id}
                onPress={() => setSelectedStep(selectedStep?.id === step.id ? null : step)}
                style={({ pressed }) => [
                  styles.stepCard,
                  step.status === 'running' && styles.stepCardRunning,
                  step.status === 'failed' && styles.stepCardFailed,
                  step.status === 'done' && styles.stepCardDone,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.stepCardHeader}>
                  <MaterialIcons
                    name={
                      step.status === 'done' ? 'check-circle' :
                      step.status === 'running' ? 'radio-button-checked' :
                      step.status === 'failed' ? 'cancel' : 'radio-button-unchecked'
                    }
                    size={18}
                    color={
                      step.status === 'done' ? Colors.success :
                      step.status === 'running' ? Colors.running :
                      step.status === 'failed' ? Colors.error : Colors.textMuted
                    }
                  />
                  <Text style={styles.stepCardName}>{step.name}</Text>
                  {step.endTime && step.startTime && (
                    <Text style={styles.stepCardDuration}>
                      {((step.endTime.getTime() - step.startTime.getTime()) / 1000).toFixed(1)}s
                    </Text>
                  )}
                </View>

                {selectedStep?.id === step.id && (step.output || step.error || step.details) && (
                  <View style={styles.stepCardDetail}>
                    {step.details && <Text style={styles.stepDetailText}>{step.details}</Text>}
                    {step.output && (
                      <View style={styles.outputBlock}>
                        <Text style={styles.outputLabel}>Output</Text>
                        <Text style={styles.outputText}>{step.output}</Text>
                      </View>
                    )}
                    {step.error && (
                      <View style={styles.errorBlock}>
                        <MaterialIcons name="error-outline" size={14} color={Colors.error} />
                        <Text style={styles.errorText}>{step.error}</Text>
                      </View>
                    )}
                  </View>
                )}
              </Pressable>
            ))}
          </ScrollView>
        )}

        {detailTab === 'logs' && (
          <View style={styles.terminal}>
            <View style={styles.terminalHeader}>
              <View style={styles.terminalDots}>
                <View style={[styles.terminalDot, { backgroundColor: Colors.error }]} />
                <View style={[styles.terminalDot, { backgroundColor: Colors.warning }]} />
                <View style={[styles.terminalDot, { backgroundColor: Colors.success }]} />
              </View>
              <Text style={styles.terminalTitle}>Terminal — {task.title}</Text>
            </View>
            <ScrollView
              style={styles.terminalBody}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.terminalContent}
            >
              {task.logs.length === 0 ? (
                <Text style={styles.terminalEmpty}>No logs yet. Start a task to see output.</Text>
              ) : (
                task.logs.map(log => (
                  <View key={log.id} style={styles.logLine}>
                    <Text style={styles.logTimestamp}>
                      {log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </Text>
                    <Text style={[
                      styles.logMessage,
                      log.level === 'error' && { color: Colors.error },
                      log.level === 'success' && { color: Colors.success },
                      log.level === 'warn' && { color: Colors.warning },
                      log.level === 'command' && { color: Colors.primary },
                    ]}>
                      {log.level === 'command' ? `$ ${log.message}` : log.message}
                    </Text>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        )}

        {detailTab === 'summary' && (
          <ScrollView contentContainerStyle={styles.summaryContent} showsVerticalScrollIndicator={false}>
            {/* Task info */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryCardTitle}>Task Details</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryKey}>ID</Text>
                <Text style={styles.summaryVal} numberOfLines={1}>{task.id}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryKey}>Created</Text>
                <Text style={styles.summaryVal}>{task.createdAt.toLocaleString()}</Text>
              </View>
              {task.startedAt && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryKey}>Started</Text>
                  <Text style={styles.summaryVal}>{task.startedAt.toLocaleString()}</Text>
                </View>
              )}
              {task.completedAt && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryKey}>Completed</Text>
                  <Text style={styles.summaryVal}>{task.completedAt.toLocaleString()}</Text>
                </View>
              )}
              <View style={styles.summaryRow}>
                <Text style={styles.summaryKey}>Steps</Text>
                <Text style={styles.summaryVal}>
                  {task.steps.filter(s => s.status === 'done').length}/{task.steps.length}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryKey}>Logs</Text>
                <Text style={styles.summaryVal}>{task.logs.length} entries</Text>
              </View>
            </View>

            {/* Result */}
            {task.result && (
              <View style={styles.summaryCard}>
                <Text style={styles.summaryCardTitle}>Result</Text>
                <Text style={styles.resultText}>{task.result}</Text>
              </View>
            )}

            {/* Error */}
            {task.error && (
              <View style={[styles.summaryCard, styles.errorCard]}>
                <View style={styles.errorCardHeader}>
                  <MaterialIcons name="warning" size={16} color={Colors.error} />
                  <Text style={[styles.summaryCardTitle, { color: Colors.error }]}>Error</Text>
                </View>
                <Text style={styles.errorCardText}>{task.error}</Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>
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
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.bgField, borderWidth: 1, borderColor: Colors.border,
    flexShrink: 0,
  },
  headerCenter: { flex: 1, gap: 2 },
  headerTitle: {
    fontSize: FontSize.lg, fontWeight: FontWeight.bold,
    color: Colors.textPrimary, includeFontPadding: false,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: FontSize.xs, fontWeight: FontWeight.medium, includeFontPadding: false },
  progressSection: { padding: Spacing.lg },
  detailTabs: {
    flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  detailTab: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 5,
    paddingVertical: Spacing.md, borderBottomWidth: 2, borderBottomColor: 'transparent',
    minHeight: 44,
  },
  detailTabActive: { borderBottomColor: Colors.primary },
  detailTabText: {
    fontSize: FontSize.sm, color: Colors.textMuted,
    fontWeight: FontWeight.medium, includeFontPadding: false,
  },
  detailTabTextActive: { color: Colors.primary },
  stepsContent: { padding: Spacing.lg, gap: Spacing.md },
  stepCard: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border, padding: Spacing.md,
  },
  stepCardRunning: { borderColor: Colors.running + '55', backgroundColor: Colors.running + '08' },
  stepCardFailed: { borderColor: Colors.error + '55', backgroundColor: Colors.errorBg },
  stepCardDone: { borderColor: Colors.success + '33' },
  stepCardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  stepCardName: {
    flex: 1, fontSize: FontSize.md, color: Colors.textPrimary,
    fontWeight: FontWeight.medium, includeFontPadding: false,
  },
  stepCardDuration: { fontSize: FontSize.xs, color: Colors.textMuted, includeFontPadding: false },
  stepCardDetail: { marginTop: Spacing.md, gap: Spacing.sm },
  stepDetailText: { fontSize: FontSize.sm, color: Colors.textSecondary, includeFontPadding: false },
  outputBlock: {
    backgroundColor: Colors.bg, borderRadius: Radius.sm,
    padding: Spacing.md, gap: 4,
  },
  outputLabel: { fontSize: FontSize.xs, color: Colors.textMuted, includeFontPadding: false },
  outputText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontFamily: 'monospace', includeFontPadding: false },
  errorBlock: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm,
    backgroundColor: Colors.errorBg, borderRadius: Radius.sm, padding: Spacing.md,
  },
  errorText: { flex: 1, fontSize: FontSize.sm, color: Colors.error, includeFontPadding: false },

  // Terminal
  terminal: { flex: 1, margin: Spacing.lg, borderRadius: Radius.lg, overflow: 'hidden', backgroundColor: '#0D1117', borderWidth: 1, borderColor: Colors.border },
  terminalHeader: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.bgCard, paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  terminalDots: { flexDirection: 'row', gap: 5 },
  terminalDot: { width: 10, height: 10, borderRadius: 5 },
  terminalTitle: { fontSize: FontSize.xs, color: Colors.textMuted, flex: 1, includeFontPadding: false },
  terminalBody: { flex: 1 },
  terminalContent: { padding: Spacing.md, gap: 3 },
  terminalEmpty: { fontSize: FontSize.sm, color: Colors.textMuted, fontFamily: 'monospace', includeFontPadding: false },
  logLine: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start' },
  logTimestamp: { fontSize: 10, color: Colors.textMuted, fontFamily: 'monospace', includeFontPadding: false, marginTop: 2, flexShrink: 0, width: 62 },
  logMessage: { fontSize: 12, color: '#E6EDF3', fontFamily: 'monospace', flex: 1, lineHeight: 18, includeFontPadding: false },

  // Summary
  summaryContent: { padding: Spacing.lg, gap: Spacing.lg },
  summaryCard: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.border, padding: Spacing.lg, gap: Spacing.md,
  },
  summaryCardTitle: {
    fontSize: FontSize.md, fontWeight: FontWeight.semibold,
    color: Colors.textPrimary, includeFontPadding: false,
  },
  summaryRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  summaryKey: {
    width: 90, fontSize: FontSize.sm, color: Colors.textMuted,
    fontWeight: FontWeight.medium, includeFontPadding: false,
  },
  summaryVal: {
    flex: 1, fontSize: FontSize.sm, color: Colors.textSecondary, includeFontPadding: false,
  },
  resultText: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 22, includeFontPadding: false },
  errorCard: { borderColor: Colors.error + '44', backgroundColor: Colors.errorBg },
  errorCardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  errorCardText: { fontSize: FontSize.sm, color: Colors.error, includeFontPadding: false },
  emptyState: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md,
    paddingHorizontal: Spacing.xxxl,
  },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.textPrimary, includeFontPadding: false },
  emptySubtitle: { fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center', includeFontPadding: false },
  pressed: { opacity: 0.65 },
});
