import React, { memo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Linking,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { MODE_COLORS } from '@/constants/config';
import type { Message } from '@/contexts/ChatContext';

interface ChatMessageProps {
  message: Message;
  onLongPress?: () => void;
}

export const ChatMessage = memo(function ChatMessage({
  message,
  onLongPress,
}: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderContent = (content: string) => {
    // Parse basic markdown-like formatting
    const parts: React.ReactNode[] = [];
    const lines = content.split('\n');

    lines.forEach((line, lineIdx) => {
      if (line.startsWith('**') && line.endsWith('**') && line.length > 4) {
        parts.push(
          <Text key={lineIdx} style={styles.bold}>
            {line.slice(2, -2)}
          </Text>
        );
      } else if (line.startsWith('# ')) {
        parts.push(
          <Text key={lineIdx} style={styles.heading}>
            {line.slice(2)}
          </Text>
        );
      } else if (line.startsWith('## ')) {
        parts.push(
          <Text key={lineIdx} style={styles.subheading}>
            {line.slice(3)}
          </Text>
        );
      } else if (line.startsWith('```')) {
        // Start/end of code block - simplified rendering
        parts.push(
          <View key={lineIdx} style={styles.codeIndicator}>
            <MaterialIcons name="code" size={12} color={Colors.primary} />
            <Text style={styles.codeIndicatorText}>code block</Text>
          </View>
        );
      } else if (line.match(/^\d+\. /)) {
        parts.push(
          <Text key={lineIdx} style={styles.listItem}>
            {line}
          </Text>
        );
      } else if (line.startsWith('- ') || line.startsWith('• ')) {
        parts.push(
          <Text key={lineIdx} style={styles.listItem}>
            {'• ' + line.slice(2)}
          </Text>
        );
      } else if (line.trim() === '') {
        parts.push(<View key={lineIdx} style={styles.spacer} />);
      } else {
        // Parse inline bold
        const inlineParts: React.ReactNode[] = [];
        const boldRegex = /\*\*(.*?)\*\*/g;
        let lastIdx = 0;
        let match;

        while ((match = boldRegex.exec(line)) !== null) {
          if (match.index > lastIdx) {
            inlineParts.push(
              <Text key={`${lineIdx}_t_${lastIdx}`} style={styles.bodyText}>
                {line.slice(lastIdx, match.index)}
              </Text>
            );
          }
          inlineParts.push(
            <Text key={`${lineIdx}_b_${match.index}`} style={styles.bold}>
              {match[1]}
            </Text>
          );
          lastIdx = match.index + match[0].length;
        }

        if (lastIdx < line.length) {
          inlineParts.push(
            <Text key={`${lineIdx}_t_end`} style={styles.bodyText}>
              {line.slice(lastIdx)}
            </Text>
          );
        }

        if (inlineParts.length > 0) {
          parts.push(
            <Text key={lineIdx} style={styles.bodyText}>
              {inlineParts}
            </Text>
          );
        } else {
          parts.push(
            <Text key={lineIdx} style={styles.bodyText}>
              {line}
            </Text>
          );
        }
      }
    });

    return parts;
  };

  return (
    <Pressable
      onLongPress={onLongPress}
      style={[
        styles.container,
        isUser && styles.containerUser,
        isAssistant && styles.containerAssistant,
      ]}
    >
      {isAssistant && (
        <View style={styles.avatarWrapper}>
          <Image
            source={require('@/assets/images/lzainova-logo.png')}
            style={styles.avatar}
            contentFit="cover"
            transition={200}
          />
        </View>
      )}

      <View style={[
        styles.bubble,
        isUser && styles.bubbleUser,
        isAssistant && styles.bubbleAssistant,
        message.error && styles.bubbleError,
      ]}>
        {message.isStreaming && !message.content && (
          <View style={styles.typingIndicator}>
            <View style={[styles.dot, styles.dot1]} />
            <View style={[styles.dot, styles.dot2]} />
            <View style={[styles.dot, styles.dot3]} />
          </View>
        )}

        {message.content ? (
          <View style={styles.contentWrapper}>
            {renderContent(message.content)}
          </View>
        ) : null}

        {message.error && !message.content && (
          <View style={styles.errorRow}>
            <MaterialIcons name="error-outline" size={14} color={Colors.error} />
            <Text style={styles.errorText}>{message.error}</Text>
          </View>
        )}

        {/* Search sources */}
        {message.searchSources && message.searchSources.length > 0 && (
          <View style={styles.sourcesContainer}>
            <Text style={styles.sourcesLabel}>Sources:</Text>
            {message.searchSources.slice(0, 3).map((source, idx) => (
              <Pressable
                key={idx}
                onPress={() => Linking.openURL(source.url)}
                style={styles.sourceItem}
              >
                <MaterialIcons name="link" size={12} color={Colors.primary} />
                <Text style={styles.sourceTitle} numberOfLines={1}>
                  {source.title}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Tool calls */}
        {message.toolCalls && message.toolCalls.length > 0 && (
          <View style={styles.toolCallsContainer}>
            {message.toolCalls.map(tc => (
              <View key={tc.id} style={styles.toolCallItem}>
                <MaterialIcons
                  name="build"
                  size={12}
                  color={tc.status === 'done' ? Colors.success : Colors.primary}
                />
                <Text style={styles.toolCallText}>{tc.tool}</Text>
                {tc.status === 'done' && (
                  <MaterialIcons name="check" size={12} color={Colors.success} />
                )}
              </View>
            ))}
          </View>
        )}

        <View style={styles.footer}>
          {message.mode && (
            <View style={[styles.modeBadge, { borderColor: MODE_COLORS[message.mode] + '44' }]}>
              <View style={[styles.modeDot, { backgroundColor: MODE_COLORS[message.mode] }]} />
              <Text style={[styles.modeText, { color: MODE_COLORS[message.mode] }]}>
                {message.mode}
              </Text>
            </View>
          )}
          <Text style={styles.timestamp}>{formatTime(message.timestamp)}</Text>
          {message.isStreaming && (
            <View style={styles.streamingCursor} />
          )}
        </View>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.xs,
    gap: Spacing.sm,
  },
  containerUser: {
    justifyContent: 'flex-end',
  },
  containerAssistant: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  avatarWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 4,
    flexShrink: 0,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.borderAccent,
  },
  avatar: {
    width: 32,
    height: 32,
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  bubbleUser: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: Radius.xs,
  },
  bubbleAssistant: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderBottomLeftRadius: Radius.xs,
  },
  bubbleError: {
    borderColor: Colors.error + '44',
  },
  contentWrapper: {
    gap: 3,
  },
  bodyText: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    lineHeight: 22,
    includeFontPadding: false,
  },
  bold: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    includeFontPadding: false,
  },
  heading: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
    includeFontPadding: false,
  },
  subheading: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginTop: Spacing.xs,
    includeFontPadding: false,
  },
  listItem: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    lineHeight: 22,
    paddingLeft: Spacing.sm,
    includeFontPadding: false,
  },
  codeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.bgField,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.xs,
    alignSelf: 'flex-start',
  },
  codeIndicatorText: {
    fontSize: FontSize.xs,
    color: Colors.primary,
    fontFamily: 'monospace',
    includeFontPadding: false,
  },
  spacer: {
    height: Spacing.xs,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.textSecondary,
  },
  dot1: { opacity: 0.4 },
  dot2: { opacity: 0.7 },
  dot3: { opacity: 1 },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  errorText: {
    fontSize: FontSize.sm,
    color: Colors.error,
    flex: 1,
    includeFontPadding: false,
  },
  sourcesContainer: {
    marginTop: Spacing.sm,
    gap: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
  },
  sourcesLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: FontWeight.semibold,
    includeFontPadding: false,
  },
  sourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sourceTitle: {
    fontSize: FontSize.xs,
    color: Colors.primary,
    flex: 1,
    includeFontPadding: false,
  },
  toolCallsContainer: {
    gap: 4,
    marginTop: Spacing.xs,
  },
  toolCallItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.bgField,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    alignSelf: 'flex-start',
  },
  toolCallText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    includeFontPadding: false,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 3,
  },
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  modeDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  modeText: {
    fontSize: 10,
    fontWeight: FontWeight.medium,
    includeFontPadding: false,
  },
  timestamp: {
    fontSize: 10,
    color: Colors.textMuted,
    marginLeft: 'auto',
    includeFontPadding: false,
  },
  streamingCursor: {
    width: 2,
    height: 14,
    backgroundColor: Colors.primary,
    borderRadius: 1,
  },
});
