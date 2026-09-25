import React, { useState } from 'react';
import {
  View, Text, Pressable, StyleSheet, FlatList,
  TextInput, Modal, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { useApp } from '@/hooks/useApp';
import { useProjects } from '@/hooks/useProjects';
import { ProjectCard } from '@/components';
import type { ProjectType } from '@/constants/config';

type LibraryTab = 'projects' | 'documents' | 'images' | 'code';

const LIBRARY_TABS: LibraryTab[] = ['projects', 'documents', 'images', 'code'];

const TAB_ICONS: Record<LibraryTab, React.ComponentProps<typeof MaterialIcons>['name']> = {
  projects: 'account-tree',
  documents: 'description',
  images: 'image',
  code: 'code',
};

const PROJECT_TYPES: { id: ProjectType; labelKey: 'androidApp' | 'webApp' | 'apiService' | 'mlModel' | 'other' }[] = [
  { id: 'android', labelKey: 'androidApp' },
  { id: 'web', labelKey: 'webApp' },
  { id: 'api', labelKey: 'apiService' },
  { id: 'ml', labelKey: 'mlModel' },
  { id: 'other', labelKey: 'other' },
];

export default function LibraryScreen() {
  const { t } = useApp();
  const { projects, createProject, setActiveProject } = useProjects();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<LibraryTab>('projects');
  const [showNewProject, setShowNewProject] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectType, setProjectType] = useState<ProjectType>('android');
  const [projectDesc, setProjectDesc] = useState('');

  const handleCreateProject = () => {
    if (!projectName.trim()) return;
    createProject(projectName.trim(), projectType, projectDesc.trim());
    setProjectName('');
    setProjectDesc('');
    setProjectType('android');
    setShowNewProject(false);
  };

  const handleOpenProject = (id: string) => {
    setActiveProject(id);
    router.push('/project-detail');
  };

  const renderEmpty = (tab: LibraryTab) => (
    <View style={styles.emptyState}>
      <MaterialIcons name={TAB_ICONS[tab]} size={48} color={Colors.textMuted} />
      <Text style={styles.emptyTitle}>
        {tab === 'projects' ? t('noProjects') : `No ${tab} yet`}
      </Text>
      <Text style={styles.emptySubtitle}>
        {tab === 'projects' ? t('createFirstProject') : `Add ${tab} through chat or tasks`}
      </Text>
    </View>
  );

  const renderProjects = () => (
    <FlatList
      data={projects}
      keyExtractor={p => p.id}
      renderItem={({ item }) => (
        <Pressable onPress={() => handleOpenProject(item.id)}>
          <ProjectCard project={item} />
        </Pressable>
      )}
      contentContainerStyle={styles.list}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListEmptyComponent={renderEmpty('projects')}
      showsVerticalScrollIndicator={false}
    />
  );

  const renderComingSoon = (tab: LibraryTab) => (
    <View style={styles.emptyState}>
      <MaterialIcons name={TAB_ICONS[tab]} size={48} color={Colors.textMuted} />
      <Text style={styles.emptyTitle}>Coming Soon</Text>
      <Text style={styles.emptySubtitle}>
        {tab === 'documents' ? 'Documents added via chat or tasks will appear here' :
         tab === 'images' ? 'Images analyzed or generated will appear here' :
         'Code files from your projects will appear here'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('library')}</Text>
        {activeTab === 'projects' && (
          <Pressable
            onPress={() => setShowNewProject(true)}
            style={({ pressed }) => [styles.addBtn, pressed && styles.pressed]}
          >
            <MaterialIcons name="add" size={22} color={Colors.textPrimary} />
            <Text style={styles.addBtnText}>{t('newProject')}</Text>
          </Pressable>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}>
          {LIBRARY_TABS.map(tab => {
            const isActive = activeTab === tab;
            return (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={({ pressed }) => [
                  styles.tab,
                  isActive && styles.tabActive,
                  pressed && styles.pressed,
                ]}
              >
                <MaterialIcons
                  name={TAB_ICONS[tab]}
                  size={16}
                  color={isActive ? Colors.primary : Colors.textMuted}
                />
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                  {t(tab as any)}
                </Text>
                {tab === 'projects' && projects.length > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{projects.length}</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Content */}
      <View style={styles.flex}>
        {activeTab === 'projects' && renderProjects()}
        {activeTab !== 'projects' && renderComingSoon(activeTab)}
      </View>

      {/* New Project Modal */}
      <Modal
        visible={showNewProject}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNewProject(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{t('newProject')}</Text>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>{t('projectName')}</Text>
              <TextInput
                style={styles.fieldInput}
                value={projectName}
                onChangeText={setProjectName}
                placeholder="My Awesome App"
                placeholderTextColor={Colors.textMuted}
                selectionColor={Colors.primary}
                autoFocus
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>{t('projectType')}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.typeList}>
                {PROJECT_TYPES.map(pt => (
                  <Pressable
                    key={pt.id}
                    onPress={() => setProjectType(pt.id)}
                    style={({ pressed }) => [
                      styles.typeChip,
                      projectType === pt.id && styles.typeChipActive,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={[
                      styles.typeChipText,
                      projectType === pt.id && styles.typeChipTextActive,
                    ]}>
                      {t(pt.labelKey)}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>{t('description')}</Text>
              <TextInput
                style={[styles.fieldInput, styles.fieldInputMulti]}
                value={projectDesc}
                onChangeText={setProjectDesc}
                placeholder="What does this project do?"
                placeholderTextColor={Colors.textMuted}
                multiline
                numberOfLines={3}
                selectionColor={Colors.primary}
              />
            </View>

            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setShowNewProject(false)}
                style={({ pressed }) => [styles.cancelBtn, pressed && styles.pressed]}
              >
                <Text style={styles.cancelText}>{t('cancel')}</Text>
              </Pressable>
              <Pressable
                onPress={handleCreateProject}
                disabled={!projectName.trim()}
                style={({ pressed }) => [
                  styles.createBtn,
                  !projectName.trim() && styles.createBtnDisabled,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.createText}>{t('create')}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: FontSize.xl, fontWeight: FontWeight.bold,
    color: Colors.textPrimary, includeFontPadding: false,
  },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.xs,
    backgroundColor: Colors.primary, borderRadius: Radius.md,
    paddingHorizontal: Spacing.md, paddingVertical: 8,
  },
  addBtnText: {
    fontSize: FontSize.sm, color: Colors.textPrimary,
    fontWeight: FontWeight.semibold, includeFontPadding: false,
  },
  tabs: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  tabsContent: {
    flexDirection: 'row', paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm, gap: Spacing.sm,
  },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: Spacing.md, paddingVertical: 8,
    borderRadius: Radius.full, borderWidth: 1, borderColor: 'transparent',
    minHeight: 36,
  },
  tabActive: { backgroundColor: Colors.primary + '18', borderColor: Colors.primary + '44' },
  tabLabel: {
    fontSize: FontSize.sm, color: Colors.textMuted,
    fontWeight: FontWeight.medium, includeFontPadding: false,
  },
  tabLabelActive: { color: Colors.primary },
  badge: {
    backgroundColor: Colors.primary, borderRadius: Radius.full,
    minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { fontSize: 10, color: Colors.textPrimary, fontWeight: FontWeight.bold, includeFontPadding: false },
  list: { padding: Spacing.lg, gap: Spacing.md },
  separator: { height: Spacing.md },
  emptyState: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: Spacing.xxxl, gap: Spacing.md, paddingTop: 80,
  },
  emptyTitle: {
    fontSize: FontSize.lg, fontWeight: FontWeight.semibold,
    color: Colors.textPrimary, includeFontPadding: false,
  },
  emptySubtitle: {
    fontSize: FontSize.sm, color: Colors.textMuted,
    textAlign: 'center', lineHeight: 22, includeFontPadding: false,
  },
  pressed: { opacity: 0.65 },

  // Modal
  modalOverlay: {
    flex: 1, justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalSheet: {
    backgroundColor: Colors.bgCard, borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl, borderTopWidth: 1,
    borderColor: Colors.borderAccent, padding: Spacing.xl,
    paddingBottom: 48, gap: Spacing.lg,
  },
  modalHandle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: Colors.textMuted, alignSelf: 'center', marginBottom: Spacing.sm,
  },
  modalTitle: {
    fontSize: FontSize.xl, fontWeight: FontWeight.bold,
    color: Colors.textPrimary, includeFontPadding: false,
  },
  formField: { gap: Spacing.sm },
  fieldLabel: {
    fontSize: FontSize.sm, color: Colors.textSecondary,
    fontWeight: FontWeight.medium, includeFontPadding: false,
  },
  fieldInput: {
    backgroundColor: Colors.bgField, borderWidth: 1, borderColor: Colors.border,
    borderRadius: Radius.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    fontSize: FontSize.md, color: Colors.textPrimary, includeFontPadding: false,
    minHeight: 48,
  },
  fieldInputMulti: { minHeight: 80, textAlignVertical: 'top' },
  typeList: { flexDirection: 'row', gap: Spacing.sm },
  typeChip: {
    paddingHorizontal: Spacing.md, paddingVertical: 8,
    borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.bgField, minHeight: 36,
  },
  typeChipActive: { backgroundColor: Colors.primary + '20', borderColor: Colors.primary },
  typeChipText: { fontSize: FontSize.sm, color: Colors.textSecondary, includeFontPadding: false },
  typeChipTextActive: { color: Colors.primary, fontWeight: FontWeight.medium },
  modalActions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.sm },
  cancelBtn: {
    flex: 1, borderWidth: 1, borderColor: Colors.border,
    borderRadius: Radius.md, paddingVertical: Spacing.md,
    alignItems: 'center', minHeight: 48,
  },
  cancelText: { fontSize: FontSize.md, color: Colors.textSecondary, fontWeight: FontWeight.medium, includeFontPadding: false },
  createBtn: {
    flex: 2, backgroundColor: Colors.primary, borderRadius: Radius.md,
    paddingVertical: Spacing.md, alignItems: 'center', minHeight: 48,
  },
  createBtnDisabled: { opacity: 0.4 },
  createText: { fontSize: FontSize.md, color: Colors.textPrimary, fontWeight: FontWeight.semibold, includeFontPadding: false },
});
