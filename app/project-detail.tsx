import React, { useState } from 'react';
import {
  View, Text, Pressable, StyleSheet, FlatList, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { useProjects } from '@/hooks/useProjects';
import { useApp } from '@/hooks/useApp';
import { CodeViewer } from '@/components';
import type { ProjectFile } from '@/contexts/ProjectContext';

type ProjectTab = 'files' | 'tasks' | 'builds' | 'tests' | 'changes' | 'logs';

const PROJECT_TABS: { id: ProjectTab; icon: React.ComponentProps<typeof MaterialIcons>['name'] }[] = [
  { id: 'files', icon: 'insert-drive-file' },
  { id: 'builds', icon: 'build-circle' },
  { id: 'tests', icon: 'science' },
  { id: 'changes', icon: 'history' },
  { id: 'logs', icon: 'article' },
];

export default function ProjectDetailScreen() {
  const router = useRouter();
  const { t } = useApp();
  const { activeProject } = useProjects();
  const [activeTab, setActiveTab] = useState<ProjectTab>('files');
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);

  if (!activeProject) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={22} color={Colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>No project selected</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderFiles = () => (
    activeProject.files.length === 0 ? (
      <View style={styles.emptyState}>
        <MaterialIcons name="folder-open" size={40} color={Colors.textMuted} />
        <Text style={styles.emptyText}>No files yet</Text>
        <Text style={styles.emptySubText}>Files created by the Agent will appear here</Text>
      </View>
    ) : (
      <FlatList
        data={activeProject.files}
        keyExtractor={f => f.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => setSelectedFile(selectedFile?.id === item.id ? null : item)}
            style={({ pressed }) => [styles.fileItem, pressed && styles.pressed]}
          >
            <MaterialIcons name="insert-drive-file" size={18} color={Colors.primary} />
            <View style={styles.fileInfo}>
              <Text style={styles.fileName}>{item.name}</Text>
              <Text style={styles.fileMeta}>{item.language} · {item.size} bytes</Text>
            </View>
            <MaterialIcons
              name={selectedFile?.id === item.id ? 'expand-less' : 'expand-more'}
              size={20} color={Colors.textMuted}
            />
          </Pressable>
        )}
        ListFooterComponent={
          selectedFile ? (
            <View style={styles.codeViewerWrapper}>
              <CodeViewer
                code={selectedFile.content}
                language={selectedFile.language}
                filename={selectedFile.name}
                maxHeight={300}
              />
            </View>
          ) : null
        }
      />
    )
  );

  const renderBuilds = () => (
    activeProject.builds.length === 0 ? (
      <View style={styles.emptyState}>
        <MaterialIcons name="build" size={40} color={Colors.textMuted} />
        <Text style={styles.emptyText}>No builds yet</Text>
      </View>
    ) : (
      <FlatList
        data={activeProject.builds}
        keyExtractor={b => b.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={[
            styles.buildCard,
            item.status === 'success' && styles.buildSuccess,
            item.status === 'failed' && styles.buildFailed,
          ]}>
            <View style={styles.buildHeader}>
              <MaterialIcons
                name={item.status === 'success' ? 'check-circle' : item.status === 'failed' ? 'cancel' : 'hourglass-empty'}
                size={18}
                color={item.status === 'success' ? Colors.success : item.status === 'failed' ? Colors.error : Colors.textMuted}
              />
              <Text style={styles.buildStatus}>{item.status.toUpperCase()}</Text>
              <Text style={styles.buildTime}>{item.duration}ms · {item.exitCode === 0 ? 'Exit 0' : `Exit ${item.exitCode}`}</Text>
            </View>
            {item.stderr ? (
              <Text style={styles.buildStderr} numberOfLines={3}>{item.stderr}</Text>
            ) : null}
          </View>
        )}
      />
    )
  );

  const renderTests = () => (
    activeProject.tests.length === 0 ? (
      <View style={styles.emptyState}>
        <MaterialIcons name="science" size={40} color={Colors.textMuted} />
        <Text style={styles.emptyText}>No tests yet</Text>
      </View>
    ) : (
      <FlatList
        data={activeProject.tests}
        keyExtractor={t => t.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.testRow}>
            <MaterialIcons
              name={item.status === 'pass' ? 'check-circle' : item.status === 'fail' ? 'cancel' : 'skip-next'}
              size={16}
              color={item.status === 'pass' ? Colors.success : item.status === 'fail' ? Colors.error : Colors.warning}
            />
            <Text style={styles.testName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.testDuration}>{item.duration}ms</Text>
          </View>
        )}
      />
    )
  );

  const renderChanges = () => (
    activeProject.changes.length === 0 ? (
      <View style={styles.emptyState}>
        <MaterialIcons name="history" size={40} color={Colors.textMuted} />
        <Text style={styles.emptyText}>No changes recorded</Text>
      </View>
    ) : (
      <FlatList
        data={activeProject.changes}
        keyExtractor={c => c.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.changeRow}>
            <View style={[
              styles.changeIcon,
              item.action === 'created' && { backgroundColor: Colors.success + '20' },
              item.action === 'modified' && { backgroundColor: Colors.primary + '20' },
              item.action === 'deleted' && { backgroundColor: Colors.error + '20' },
            ]}>
              <MaterialIcons
                name={item.action === 'created' ? 'add' : item.action === 'modified' ? 'edit' : 'delete'}
                size={14}
                color={item.action === 'created' ? Colors.success : item.action === 'modified' ? Colors.primary : Colors.error}
              />
            </View>
            <View style={styles.changeInfo}>
              <Text style={styles.changePath} numberOfLines={1}>{item.filePath}</Text>
              <Text style={styles.changeTime}>{item.timestamp.toLocaleString()}</Text>
            </View>
          </View>
        )}
      />
    )
  );

  const renderLogs = () => (
    <ScrollView contentContainerStyle={styles.logsContent}>
      {activeProject.logs.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="article" size={40} color={Colors.textMuted} />
          <Text style={styles.emptyText}>No logs yet</Text>
        </View>
      ) : (
        activeProject.logs.map((log, idx) => (
          <Text key={idx} style={styles.logLine}>{log}</Text>
        ))
      )}
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={22} color={Colors.textPrimary} />
        </Pressable>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>{activeProject.name}</Text>
          <Text style={styles.headerSub}>{activeProject.type} · {activeProject.files.length} files</Text>
        </View>
      </View>

      {/* Description */}
      {activeProject.description ? (
        <View style={styles.descSection}>
          <Text style={styles.descText}>{activeProject.description}</Text>
        </View>
      ) : null}

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        style={styles.tabsBar} contentContainerStyle={styles.tabsContent}>
        {PROJECT_TABS.map(tab => (
          <Pressable
            key={tab.id}
            onPress={() => setActiveTab(tab.id)}
            style={({ pressed }) => [
              styles.tabItem,
              activeTab === tab.id && styles.tabItemActive,
              pressed && styles.pressed,
            ]}
          >
            <MaterialIcons
              name={tab.icon}
              size={15}
              color={activeTab === tab.id ? Colors.primary : Colors.textMuted}
            />
            <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
              {t(tab.id as any)}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Content */}
      <View style={styles.flex}>
        {activeTab === 'files' && renderFiles()}
        {activeTab === 'builds' && renderBuilds()}
        {activeTab === 'tests' && renderTests()}
        {activeTab === 'changes' && renderChanges()}
        {activeTab === 'logs' && renderLogs()}
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
    width: 40, height: 40, borderRadius: 20, alignItems: 'center',
    justifyContent: 'center', backgroundColor: Colors.bgField,
    borderWidth: 1, borderColor: Colors.border, flexShrink: 0,
  },
  headerInfo: { flex: 1, gap: 2 },
  headerTitle: {
    fontSize: FontSize.lg, fontWeight: FontWeight.bold,
    color: Colors.textPrimary, includeFontPadding: false,
  },
  headerSub: { fontSize: FontSize.xs, color: Colors.textMuted, includeFontPadding: false },
  descSection: {
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  descText: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20, includeFontPadding: false },
  tabsBar: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  tabsContent: {
    flexDirection: 'row', paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm, gap: Spacing.sm,
  },
  tabItem: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: Spacing.md, paddingVertical: 8,
    borderRadius: Radius.full, borderWidth: 1, borderColor: 'transparent',
    minHeight: 36,
  },
  tabItemActive: { backgroundColor: Colors.primary + '18', borderColor: Colors.primary + '44' },
  tabText: { fontSize: FontSize.sm, color: Colors.textMuted, fontWeight: FontWeight.medium, includeFontPadding: false },
  tabTextActive: { color: Colors.primary },
  listContent: { padding: Spacing.lg, gap: Spacing.sm },
  fileItem: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.bgCard, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border, padding: Spacing.md,
  },
  fileInfo: { flex: 1, gap: 2 },
  fileName: { fontSize: FontSize.md, color: Colors.textPrimary, fontWeight: FontWeight.medium, includeFontPadding: false },
  fileMeta: { fontSize: FontSize.xs, color: Colors.textMuted, includeFontPadding: false },
  codeViewerWrapper: { marginTop: Spacing.md },
  buildCard: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border, padding: Spacing.md, gap: Spacing.sm,
  },
  buildSuccess: { borderColor: Colors.success + '44' },
  buildFailed: { borderColor: Colors.error + '44' },
  buildHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  buildStatus: { fontSize: FontSize.sm, color: Colors.textPrimary, fontWeight: FontWeight.semibold, flex: 1, includeFontPadding: false },
  buildTime: { fontSize: FontSize.xs, color: Colors.textMuted, includeFontPadding: false },
  buildStderr: { fontSize: 12, color: Colors.error, fontFamily: 'monospace', includeFontPadding: false },
  testRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.bgCard, borderRadius: Radius.sm,
    borderWidth: 1, borderColor: Colors.border, padding: Spacing.md,
  },
  testName: { flex: 1, fontSize: FontSize.sm, color: Colors.textPrimary, includeFontPadding: false },
  testDuration: { fontSize: FontSize.xs, color: Colors.textMuted, includeFontPadding: false },
  changeRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.bgCard, borderRadius: Radius.sm,
    borderWidth: 1, borderColor: Colors.border, padding: Spacing.md,
  },
  changeIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  changeInfo: { flex: 1, gap: 2 },
  changePath: { fontSize: FontSize.sm, color: Colors.textPrimary, fontFamily: 'monospace', includeFontPadding: false },
  changeTime: { fontSize: FontSize.xs, color: Colors.textMuted, includeFontPadding: false },
  logsContent: { padding: Spacing.lg, gap: 4 },
  logLine: { fontSize: 12, color: Colors.textSecondary, fontFamily: 'monospace', lineHeight: 18, includeFontPadding: false },
  emptyState: {
    flex: 1, alignItems: 'center', paddingTop: 60, gap: Spacing.md,
    paddingHorizontal: Spacing.xxxl,
  },
  emptyText: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.textPrimary, includeFontPadding: false },
  emptySubText: { fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center', includeFontPadding: false },
  pressed: { opacity: 0.65 },
});
