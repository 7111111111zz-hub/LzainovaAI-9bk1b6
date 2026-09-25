import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { useApp } from '@/hooks/useApp';
import { useChat } from '@/hooks/useChat';
import { useAgent } from '@/hooks/useAgent';
import { ChatMessage, AgentModeSelector, SuggestionChips, ToolsBottomSheet, TaskProgress } from '@/components';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ChatScreen() {
  const { t, activeMode } = useApp();
  const { conversations, activeConversation, createConversation, isLoading, sendMessage } = useChat();
  const { tasks, activeTask } = useAgent();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [inputText, setInputText] = useState('');
  const [showTools, setShowTools] = useState(false);
  const [showConversations, setShowConversations] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const hasMessages = activeConversation && activeConversation.messages.length > 0;
  const runningTask = tasks.find(t => t.status === 'running' || t.status === 'planning');

  useEffect(() => {
    if (hasMessages) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [activeConversation?.messages.length]);

  const handleSend = useCallback(() => {
    if (!inputText.trim() || isLoading) return;
    const text = inputText.trim();
    setInputText('');
    sendMessage(text, activeMode);
  }, [inputText, isLoading, sendMessage, activeMode]);

  const handleSuggestion = useCallback((suggestion: string) => {
    sendMessage(suggestion, activeMode);
  }, [sendMessage, activeMode]);

  const handleNewChat = useCallback(() => {
    createConversation(activeMode);
  }, [createConversation, activeMode]);

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      {/* Logo */}
      <View style={styles.logoWrapper}>
        <Image
          source={require('@/assets/images/lzainova-logo.png')}
          style={styles.logo}
          contentFit="contain"
          transition={300}
        />
      </View>

      <Text style={styles.brandName}>Lzainova AI</Text>
      <Text style={styles.tagline}>{t('tagline')}</Text>

      {/* Suggestions */}
      <View style={styles.suggestionsSection}>
        <SuggestionChips onSelect={handleSuggestion} />
      </View>

      {/* Modes */}
      <View style={styles.modesSection}>
        <AgentModeSelector compact={false} />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => setShowConversations(!showConversations)}
          style={({ pressed }) => [styles.headerLeft, pressed && styles.pressed]}
        >
          <View style={styles.logoSmall}>
            <Image
              source={require('@/assets/images/lzainova-logo.png')}
              style={{ width: 32, height: 32 }}
              contentFit="contain"
            />
          </View>
          <View>
            <Text style={styles.headerTitle}>Lzainova AI</Text>
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>{t('allAgentsOnline')}</Text>
            </View>
          </View>
        </Pressable>

        <Pressable
          onPress={handleNewChat}
          style={({ pressed }) => [styles.newChatBtn, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel={t('newChat')}
        >
          <MaterialIcons name="edit" size={22} color={Colors.textSecondary} />
        </Pressable>
      </View>

      {/* Conversations sidebar (simplified) */}
      {showConversations && conversations.length > 0 && (
        <View style={styles.convList}>
          {conversations.slice(0, 8).map(conv => (
            <Pressable
              key={conv.id}
              onPress={() => {
                setShowConversations(false);
              }}
              style={({ pressed }) => [
                styles.convItem,
                conv.id === activeConversation?.id && styles.convItemActive,
                pressed && styles.pressed,
              ]}
            >
              <MaterialIcons name="chat-bubble-outline" size={16} color={
                conv.id === activeConversation?.id ? Colors.primary : Colors.textMuted
              } />
              <Text
                style={[
                  styles.convTitle,
                  conv.id === activeConversation?.id && styles.convTitleActive,
                ]}
                numberOfLines={1}
              >
                {conv.title}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Running task indicator */}
      {runningTask && (
        <Pressable
          onPress={() => router.push('/task-execution')}
          style={({ pressed }) => [styles.taskBanner, pressed && styles.pressed]}
        >
          <View style={styles.taskBannerLeft}>
            <View style={styles.taskBannerDot} />
            <Text style={styles.taskBannerText}>{t('taskRunning')}</Text>
          </View>
          <Text style={styles.taskBannerTitle} numberOfLines={1}>
            {runningTask.title}
          </Text>
          <MaterialIcons name="open-in-new" size={16} color={Colors.running} />
        </Pressable>
      )}

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Messages or empty state */}
        {!hasMessages ? (
          <View style={styles.flex}>
            {renderEmptyState()}
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={activeConversation.messages}
            keyExtractor={item => item.id}
            renderItem={({ item }) => <ChatMessage message={item} />}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            ListFooterComponent={
              runningTask && activeTask ? (
                <View style={styles.taskProgressInline}>
                  <Pressable
                    onPress={() => router.push('/task-execution')}
                    style={({ pressed }) => pressed && styles.pressed}
                  >
                    <TaskProgress task={activeTask} compact />
                  </Pressable>
                </View>
              ) : null
            }
          />
        )}

        {/* Mode selector (compact, when has messages) */}
        {hasMessages && (
          <View style={styles.modeBar}>
            <AgentModeSelector compact />
          </View>
        )}

        {/* Input area */}
        <View style={[styles.inputArea, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.inputRow}>
            {/* Plus button */}
            <Pressable
              onPress={() => setShowTools(true)}
              style={({ pressed }) => [styles.inputIconBtn, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel="Open tools"
            >
              <MaterialIcons name="add" size={24} color={Colors.textSecondary} />
            </Pressable>

            {/* Text input */}
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                value={inputText}
                onChangeText={setInputText}
                placeholder={t('messagePlaceholder')}
                placeholderTextColor={Colors.textMuted}
                multiline
                maxLength={4000}
                returnKeyType="default"
                selectionColor={Colors.primary}
                onSubmitEditing={handleSend}
              />

              {/* Send button */}
              {inputText.trim().length > 0 && (
                <Pressable
                  onPress={handleSend}
                  disabled={isLoading}
                  style={({ pressed }) => [
                    styles.sendBtn,
                    isLoading && styles.sendBtnDisabled,
                    pressed && styles.pressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Send message"
                >
                  <MaterialIcons
                    name={isLoading ? 'stop' : 'arrow-upward'}
                    size={18}
                    color={Colors.textPrimary}
                  />
                </Pressable>
              )}
            </View>

            {/* Mic button */}
            {inputText.trim().length === 0 && (
              <Pressable
                style={({ pressed }) => [styles.inputIconBtn, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityLabel="Voice input"
              >
                <MaterialIcons name="mic" size={24} color={Colors.textSecondary} />
              </Pressable>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Tools bottom sheet */}
      <ToolsBottomSheet
        visible={showTools}
        onClose={() => setShowTools(false)}
        onSelectProject={() => router.push('/project-detail')}
        onMemory={() => {}}
        onWebSearch={() => {
          setShowTools(false);
          handleSuggestion('Search the web for: ');
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  flex: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  logoSmall: {
    width: 36,
    height: 36,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.borderAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    includeFontPadding: false,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.success,
  },
  statusText: {
    fontSize: FontSize.xs,
    color: Colors.success,
    includeFontPadding: false,
  },
  newChatBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgField,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  // Conversations list
  convList: {
    backgroundColor: Colors.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    maxHeight: 200,
  },
  convItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  convItemActive: {
    backgroundColor: Colors.primary + '15',
  },
  convTitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    flex: 1,
    includeFontPadding: false,
  },
  convTitleActive: {
    color: Colors.primary,
    fontWeight: FontWeight.medium,
  },

  // Task banner
  taskBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.running + '15',
    borderBottomWidth: 1,
    borderBottomColor: Colors.running + '33',
  },
  taskBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  taskBannerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.running,
  },
  taskBannerText: {
    fontSize: FontSize.xs,
    color: Colors.running,
    fontWeight: FontWeight.medium,
    includeFontPadding: false,
  },
  taskBannerTitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    flex: 1,
    includeFontPadding: false,
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: Spacing.xxxl,
    gap: Spacing.sm,
  },
  logoWrapper: {
    width: 88,
    height: 88,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.borderGlow,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  logo: {
    width: 72,
    height: 72,
  },
  brandName: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
    includeFontPadding: false,
  },
  tagline: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    includeFontPadding: false,
    letterSpacing: 0.3,
  },
  suggestionsSection: {
    width: '100%',
    marginTop: Spacing.xl,
  },
  modesSection: {
    width: '100%',
    marginTop: Spacing.md,
  },

  // Messages
  messagesList: {
    paddingVertical: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  taskProgressInline: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
  },

  // Mode bar (compact)
  modeBar: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingVertical: Spacing.xs,
  },

  // Input area
  inputArea: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.bg,
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  inputIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgField,
    borderWidth: 1,
    borderColor: Colors.border,
    flexShrink: 0,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Colors.bgField,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.OS === 'ios' ? Spacing.md : Spacing.sm,
    minHeight: 44,
    maxHeight: 130,
    gap: Spacing.sm,
  },
  textInput: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    includeFontPadding: false,
    lineHeight: 22,
    maxHeight: 110,
  },
  sendBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sendBtnDisabled: {
    backgroundColor: Colors.bgCard,
  },
  pressed: {
    opacity: 0.65,
  },
});
