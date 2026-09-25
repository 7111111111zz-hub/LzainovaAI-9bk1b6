import React, { memo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Clipboard,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { useApp } from '@/hooks/useApp';

interface CodeViewerProps {
  code: string;
  language?: string;
  filename?: string;
  onSave?: (code: string) => void;
  maxHeight?: number;
}

const LANGUAGE_COLORS: Record<string, string> = {
  kotlin: '#F18E33',
  java: '#EA2D2E',
  python: '#3776AB',
  typescript: '#3178C6',
  javascript: '#F7DF1E',
  json: '#89E051',
  xml: '#F1662A',
  html: '#E34F26',
  css: '#1572B6',
  shell: '#4EAA25',
  bash: '#4EAA25',
  default: Colors.primary,
};

export const CodeViewer = memo(function CodeViewer({
  code,
  language = 'text',
  filename,
  onSave,
  maxHeight = 400,
}: CodeViewerProps) {
  const { t } = useApp();
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const langColor = LANGUAGE_COLORS[language.toLowerCase()] || LANGUAGE_COLORS.default;
  const lines = code.split('\n');

  const handleCopy = () => {
    Clipboard.setString(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple syntax highlighting tokens (color-coding key elements)
  const highlightLine = (line: string, lang: string) => {
    const lower = lang.toLowerCase();

    if (lower === 'json') {
      return renderJsonLine(line);
    }
    if (lower === 'kotlin' || lower === 'java') {
      return renderKotlinLine(line);
    }
    if (lower === 'python') {
      return renderPythonLine(line);
    }

    return <Text style={styles.codeLine}>{line || ' '}</Text>;
  };

  const renderJsonLine = (line: string) => {
    const keyMatch = line.match(/^(\s*)("[\w\s]+")(\s*:\s*)(.*)/);
    if (keyMatch) {
      return (
        <Text style={styles.codeLine}>
          <Text>{keyMatch[1]}</Text>
          <Text style={{ color: '#9CDCFE' }}>{keyMatch[2]}</Text>
          <Text style={{ color: Colors.textSecondary }}>{keyMatch[3]}</Text>
          <Text style={{ color: '#CE9178' }}>{keyMatch[4]}</Text>
        </Text>
      );
    }
    return <Text style={styles.codeLine}>{line || ' '}</Text>;
  };

  const renderKotlinLine = (line: string) => {
    const keywords = ['fun ', 'val ', 'var ', 'class ', 'object ', 'if ', 'else', 'return', 'import ', 'package ', 'override', 'private', 'public', 'data class', 'suspend'];
    let colored = false;

    for (const kw of keywords) {
      if (line.trimStart().startsWith(kw)) {
        const indent = line.slice(0, line.indexOf(line.trimStart()[0]));
        const rest = line.trimStart();
        return (
          <Text style={styles.codeLine}>
            <Text>{indent}</Text>
            <Text style={{ color: '#569CD6' }}>{kw}</Text>
            <Text>{rest.slice(kw.length)}</Text>
          </Text>
        );
      }
    }

    if (line.trimStart().startsWith('//')) {
      return <Text style={[styles.codeLine, { color: '#6A9955' }]}>{line || ' '}</Text>;
    }

    if (line.includes('@')) {
      return <Text style={[styles.codeLine, { color: '#DCDCAA' }]}>{line || ' '}</Text>;
    }

    return <Text style={styles.codeLine}>{line || ' '}</Text>;
  };

  const renderPythonLine = (line: string) => {
    const keywords = ['def ', 'class ', 'import ', 'from ', 'if ', 'else:', 'elif ', 'return', 'for ', 'while ', 'async ', 'await '];

    for (const kw of keywords) {
      if (line.trimStart().startsWith(kw)) {
        const indent = line.slice(0, line.indexOf(line.trimStart()[0]));
        const rest = line.trimStart();
        return (
          <Text style={styles.codeLine}>
            <Text>{indent}</Text>
            <Text style={{ color: '#569CD6' }}>{kw}</Text>
            <Text>{rest.slice(kw.length)}</Text>
          </Text>
        );
      }
    }

    if (line.trimStart().startsWith('#')) {
      return <Text style={[styles.codeLine, { color: '#6A9955' }]}>{line || ' '}</Text>;
    }

    return <Text style={styles.codeLine}>{line || ' '}</Text>;
  };

  return (
    <View style={styles.container}>
      {/* Toolbar */}
      <View style={styles.toolbar}>
        <View style={styles.langBadge}>
          <View style={[styles.langDot, { backgroundColor: langColor }]} />
          <Text style={[styles.langText, { color: langColor }]}>
            {language.toUpperCase()}
          </Text>
        </View>

        {filename && (
          <Text style={styles.filename} numberOfLines={1}>{filename}</Text>
        )}

        <Text style={styles.lineCount}>{lines.length} {t('lines')}</Text>

        <Pressable
          onPress={handleCopy}
          style={({ pressed }) => [styles.toolBtn, pressed && styles.pressed]}
        >
          <MaterialIcons
            name={copied ? 'check' : 'content-copy'}
            size={16}
            color={copied ? Colors.success : Colors.textSecondary}
          />
          <Text style={[styles.toolBtnText, copied && { color: Colors.success }]}>
            {copied ? t('copied') : t('copy')}
          </Text>
        </Pressable>

        {onSave && (
          <Pressable
            onPress={() => { setIsEditing(!isEditing); }}
            style={({ pressed }) => [styles.toolBtn, pressed && styles.pressed]}
          >
            <MaterialIcons name={isEditing ? 'save' : 'edit'} size={16} color={Colors.textSecondary} />
          </Pressable>
        )}
      </View>

      {/* Code */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.codeScroll, { maxHeight }]}
        nestedScrollEnabled
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        >
          <View style={styles.codeContent}>
            {/* Line numbers */}
            <View style={styles.lineNumbers}>
              {lines.map((_, idx) => (
                <Text key={idx} style={styles.lineNumber}>
                  {idx + 1}
                </Text>
              ))}
            </View>
            {/* Code lines */}
            <View style={styles.codeLines}>
              {lines.map((line, idx) => (
                <View key={idx} style={styles.lineWrapper}>
                  {highlightLine(line, language)}
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0D1117',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  langBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.bgField,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  langDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  langText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    includeFontPadding: false,
  },
  filename: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    flex: 1,
    includeFontPadding: false,
  },
  lineCount: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    includeFontPadding: false,
  },
  toolBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    minHeight: 28,
  },
  toolBtnText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    includeFontPadding: false,
  },
  pressed: {
    opacity: 0.65,
  },
  codeScroll: {
    flex: 1,
  },
  codeContent: {
    flexDirection: 'row',
    paddingVertical: Spacing.md,
  },
  lineNumbers: {
    paddingHorizontal: Spacing.md,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
    minWidth: 48,
    alignItems: 'flex-end',
  },
  lineNumber: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 20,
    fontFamily: 'monospace',
    includeFontPadding: false,
  },
  codeLines: {
    paddingHorizontal: Spacing.md,
  },
  lineWrapper: {
    minHeight: 20,
  },
  codeLine: {
    fontSize: 13,
    color: '#E6EDF3',
    lineHeight: 20,
    fontFamily: 'monospace',
    includeFontPadding: false,
  },
});
