import React from 'react';
import {
  View, Text, Pressable, StyleSheet, ScrollView, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { useApp } from '@/hooks/useApp';
import { APP_CONFIG, AI_MODELS } from '@/constants/config';

export default function SettingsScreen() {
  const { t, isDarkMode, setDarkMode, language, setLanguage } = useApp();

  const SectionHeader = ({ title }: { title: string }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  const SettingRow = ({
    icon, label, value, onPress, showArrow = false, children,
  }: {
    icon: React.ComponentProps<typeof MaterialIcons>['name'];
    label: string;
    value?: string;
    onPress?: () => void;
    showArrow?: boolean;
    children?: React.ReactNode;
  }) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && onPress && styles.pressed]}
      disabled={!onPress}
    >
      <View style={styles.rowLeft}>
        <View style={styles.rowIcon}>
          <MaterialIcons name={icon} size={20} color={Colors.textSecondary} />
        </View>
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      <View style={styles.rowRight}>
        {value && <Text style={styles.rowValue}>{value}</Text>}
        {children}
        {showArrow && <MaterialIcons name="chevron-right" size={20} color={Colors.textMuted} />}
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('settings')}</Text>
      </View>

      <ScrollView style={styles.flex} showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>

        {/* Appearance */}
        <SectionHeader title={t('appearance')} />
        <View style={styles.card}>
          <SettingRow
            icon="brightness-6"
            label={isDarkMode ? t('darkMode') : t('lightMode')}
          >
            <Switch
              value={isDarkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: Colors.bgField, true: Colors.primary + '80' }}
              thumbColor={isDarkMode ? Colors.primary : Colors.textMuted}
            />
          </SettingRow>
        </View>

        {/* Language */}
        <SectionHeader title={t('language')} />
        <View style={styles.card}>
          <Pressable
            onPress={() => setLanguage('en')}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
          >
            <View style={styles.rowLeft}>
              <Text style={styles.flagText}>🇬🇧</Text>
              <Text style={styles.rowLabel}>{t('english')}</Text>
            </View>
            {language === 'en' && (
              <MaterialIcons name="check-circle" size={20} color={Colors.primary} />
            )}
          </Pressable>
          <View style={styles.rowDivider} />
          <Pressable
            onPress={() => setLanguage('ar')}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
          >
            <View style={styles.rowLeft}>
              <Text style={styles.flagText}>🇸🇦</Text>
              <Text style={styles.rowLabel}>{t('arabic')}</Text>
            </View>
            {language === 'ar' && (
              <MaterialIcons name="check-circle" size={20} color={Colors.primary} />
            )}
          </Pressable>
        </View>

        {/* AI Engine */}
        <SectionHeader title={t('aiEngine')} />
        <View style={styles.card}>
          {AI_MODELS.map((model, idx) => (
            <View key={model.id}>
              <SettingRow
                icon="auto-awesome"
                label={model.name}
                value={model.description}
              >
                {idx === 0 && (
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>Active</Text>
                  </View>
                )}
              </SettingRow>
              {idx < AI_MODELS.length - 1 && <View style={styles.rowDivider} />}
            </View>
          ))}
        </View>

        {/* Backend Status */}
        <SectionHeader title="Backend" />
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={styles.rowIcon}>
                <MaterialIcons name="cloud" size={20} color={Colors.textSecondary} />
              </View>
              <View>
                <Text style={styles.rowLabel}>OnSpace Cloud</Text>
                <Text style={styles.rowSubLabel}>Enable for real AI & sync</Text>
              </View>
            </View>
            <View style={[styles.statusChip, styles.statusChipWarning]}>
              <View style={[styles.statusDot, { backgroundColor: Colors.warning }]} />
              <Text style={[styles.statusText, { color: Colors.warning }]}>Not Connected</Text>
            </View>
          </View>
          <View style={styles.rowDivider} />
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={styles.rowIcon}>
                <MaterialIcons name="search" size={20} color={Colors.textSecondary} />
              </View>
              <View>
                <Text style={styles.rowLabel}>Web Search</Text>
                <Text style={styles.rowSubLabel}>Brave Search API (backend)</Text>
              </View>
            </View>
            <View style={[styles.statusChip, styles.statusChipWarning]}>
              <View style={[styles.statusDot, { backgroundColor: Colors.warning }]} />
              <Text style={[styles.statusText, { color: Colors.warning }]}>Needs Backend</Text>
            </View>
          </View>
        </View>

        {/* Agent Settings */}
        <SectionHeader title={t('agentSettings')} />
        <View style={styles.card}>
          <SettingRow icon="repeat" label={t('maxSteps')} value="20" />
          <View style={styles.rowDivider} />
          <SettingRow icon="verified" label={t('autoVerify')}>
            <Switch
              value={true}
              trackColor={{ false: Colors.bgField, true: Colors.primary + '80' }}
              thumbColor={Colors.primary}
            />
          </SettingRow>
        </View>

        {/* Memory */}
        <SectionHeader title={t('memorySettings')} />
        <View style={styles.card}>
          <SettingRow icon="memory" label={t('enableMemory')}>
            <Switch
              value={true}
              trackColor={{ false: Colors.bgField, true: Colors.primary + '80' }}
              thumbColor={Colors.primary}
            />
          </SettingRow>
          <View style={styles.rowDivider} />
          <SettingRow icon="delete-sweep" label={t('clearMemory')} onPress={() => {}} showArrow />
        </View>

        {/* About */}
        <SectionHeader title={t('about')} />
        <View style={styles.card}>
          <SettingRow icon="info-outline" label={t('version')} value={APP_CONFIG.version} />
          <View style={styles.rowDivider} />
          <SettingRow icon="shield" label={t('privacy')} onPress={() => {}} showArrow />
        </View>

        {/* Logo & branding */}
        <View style={styles.brandFooter}>
          <Text style={styles.brandName}>Lzainova AI</Text>
          <Text style={styles.brandTagline}>Private. Autonomous. Yours.</Text>
          <Text style={styles.brandVersion}>v{APP_CONFIG.version}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  flex: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  header: {
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: FontSize.xl, fontWeight: FontWeight.bold,
    color: Colors.textPrimary, includeFontPadding: false,
  },
  sectionHeader: {
    fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: FontWeight.semibold,
    textTransform: 'uppercase', letterSpacing: 1,
    paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, paddingBottom: Spacing.sm,
    includeFontPadding: false,
  },
  card: {
    backgroundColor: Colors.bgCard, marginHorizontal: Spacing.lg,
    borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md, minHeight: 56,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  rowIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: Colors.bgField, alignItems: 'center', justifyContent: 'center',
  },
  rowLabel: {
    fontSize: FontSize.md, color: Colors.textPrimary,
    fontWeight: FontWeight.medium, includeFontPadding: false,
  },
  rowSubLabel: {
    fontSize: FontSize.xs, color: Colors.textMuted,
    marginTop: 2, includeFontPadding: false,
  },
  rowValue: {
    fontSize: FontSize.sm, color: Colors.textSecondary, includeFontPadding: false,
  },
  rowDivider: { height: 1, backgroundColor: Colors.border, marginLeft: 56 + Spacing.lg },
  flagText: { fontSize: 22 },
  activeBadge: {
    backgroundColor: Colors.success + '20', borderRadius: Radius.full,
    paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: Colors.success + '44',
  },
  activeBadgeText: { fontSize: FontSize.xs, color: Colors.success, fontWeight: FontWeight.semibold, includeFontPadding: false },
  statusChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1,
  },
  statusChipWarning: { backgroundColor: Colors.warningBg, borderColor: Colors.warning + '44' },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: FontSize.xs, fontWeight: FontWeight.medium, includeFontPadding: false },
  brandFooter: {
    alignItems: 'center', paddingVertical: Spacing.xxxl, gap: 4,
  },
  brandName: {
    fontSize: FontSize.xl, fontWeight: FontWeight.bold,
    color: Colors.primary, includeFontPadding: false,
  },
  brandTagline: { fontSize: FontSize.sm, color: Colors.textMuted, includeFontPadding: false },
  brandVersion: { fontSize: FontSize.xs, color: Colors.textMuted, includeFontPadding: false },
  pressed: { opacity: 0.65 },
});
