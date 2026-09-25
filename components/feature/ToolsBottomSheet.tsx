import React, { memo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Dimensions,
  Modal,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { useApp } from '@/hooks/useApp';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ToolItem {
  id: string;
  labelKey: 'addFile' | 'addImage' | 'addDocument' | 'addCode' | 'selectProject' | 'lzainovaTools' | 'webSearch' | 'memory';
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  color: string;
  onPress: () => void;
  requiresBackend?: boolean;
}

interface ToolsBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelectFile?: () => void;
  onSelectImage?: () => void;
  onSelectDocument?: () => void;
  onSelectCode?: () => void;
  onSelectProject?: () => void;
  onOpenTools?: () => void;
  onWebSearch?: () => void;
  onMemory?: () => void;
}

export const ToolsBottomSheet = memo(function ToolsBottomSheet({
  visible,
  onClose,
  onSelectFile,
  onSelectImage,
  onSelectDocument,
  onSelectCode,
  onSelectProject,
  onOpenTools,
  onWebSearch,
  onMemory,
}: ToolsBottomSheetProps) {
  const { t } = useApp();
  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 240,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 240,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const tools: ToolItem[] = [
    {
      id: 'file',
      labelKey: 'addFile',
      icon: 'folder-open',
      color: Colors.primary,
      onPress: () => { onSelectFile?.(); onClose(); },
    },
    {
      id: 'image',
      labelKey: 'addImage',
      icon: 'image',
      color: Colors.modeVision,
      onPress: () => { onSelectImage?.(); onClose(); },
    },
    {
      id: 'document',
      labelKey: 'addDocument',
      icon: 'description',
      color: Colors.warning,
      onPress: () => { onSelectDocument?.(); onClose(); },
    },
    {
      id: 'code',
      labelKey: 'addCode',
      icon: 'code',
      color: Colors.modeCode,
      onPress: () => { onSelectCode?.(); onClose(); },
    },
    {
      id: 'project',
      labelKey: 'selectProject',
      icon: 'account-tree',
      color: Colors.modeTask,
      onPress: () => { onSelectProject?.(); onClose(); },
    },
    {
      id: 'tools',
      labelKey: 'lzainovaTools',
      icon: 'build',
      color: Colors.secondary,
      onPress: () => { onOpenTools?.(); onClose(); },
    },
    {
      id: 'search',
      labelKey: 'webSearch',
      icon: 'search',
      color: Colors.modeChat,
      onPress: () => { onWebSearch?.(); onClose(); },
      requiresBackend: true,
    },
    {
      id: 'memory',
      labelKey: 'memory',
      icon: 'memory',
      color: Colors.modeMemory,
      onPress: () => { onMemory?.(); onClose(); },
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[
          styles.sheet,
          { transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Handle */}
        <View style={styles.handle} />

        <Text style={styles.sheetTitle}>Lzainova Tools</Text>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.toolsGrid}
        >
          {tools.map(tool => (
            <Pressable
              key={tool.id}
              onPress={tool.onPress}
              style={({ pressed }) => [
                styles.toolItem,
                pressed && styles.pressed,
              ]}
            >
              <View style={[styles.toolIcon, { backgroundColor: tool.color + '20' }]}>
                <MaterialIcons name={tool.icon} size={22} color={tool.color} />
              </View>
              <Text style={styles.toolLabel}>{t(tool.labelKey)}</Text>
              {tool.requiresBackend && (
                <View style={styles.backendBadge}>
                  <MaterialIcons name="cloud" size={10} color={Colors.primary} />
                </View>
              )}
            </Pressable>
          ))}
        </ScrollView>
      </Animated.View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.bgCard,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    borderTopWidth: 1,
    borderColor: Colors.borderAccent,
    paddingBottom: 40,
    paddingTop: Spacing.md,
    maxHeight: SCREEN_HEIGHT * 0.65,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.textMuted,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  sheetTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
    includeFontPadding: false,
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  toolItem: {
    width: '22%',
    alignItems: 'center',
    gap: Spacing.sm,
    position: 'relative',
  },
  toolIcon: {
    width: 56,
    height: 56,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  toolLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    includeFontPadding: false,
    lineHeight: 16,
  },
  backendBadge: {
    position: 'absolute',
    top: -2,
    right: 0,
    backgroundColor: Colors.bgField,
    borderRadius: Radius.full,
    padding: 2,
    borderWidth: 1,
    borderColor: Colors.primary + '44',
  },
  pressed: {
    opacity: 0.65,
    transform: [{ scale: 0.95 }],
  },
});
