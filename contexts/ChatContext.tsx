import React, { createContext, useState, useCallback, ReactNode } from 'react';
import type { MessageRole, AgentMode } from '@/constants/config';

export interface ToolCall {
  id: string;
  tool: string;
  input: Record<string, unknown>;
  output?: string;
  status: 'pending' | 'running' | 'done' | 'failed';
}

export interface SearchSource {
  title: string;
  url: string;
  snippet: string;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  mode?: AgentMode;
  isStreaming?: boolean;
  toolCalls?: ToolCall[];
  searchSources?: SearchSource[];
  error?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  mode: AgentMode;
}

interface ChatContextType {
  conversations: Conversation[];
  activeConversationId: string | null;
  isLoading: boolean;
  streamingContent: string;
  activeConversation: Conversation | null;
  createConversation: (mode?: AgentMode) => string;
  setActiveConversation: (id: string) => void;
  addMessage: (conversationId: string, message: Omit<Message, 'id' | 'timestamp'>) => Message;
  updateMessage: (conversationId: string, messageId: string, updates: Partial<Message>) => void;
  deleteConversation: (id: string) => void;
  clearAll: () => void;
  setIsLoading: (loading: boolean) => void;
  setStreamingContent: (content: string) => void;
}

export const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');

  const activeConversation = conversations.find(c => c.id === activeConversationId) || null;

  const createConversation = useCallback((mode: AgentMode = 'chat'): string => {
    const id = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newConversation: Conversation = {
      id,
      title: 'New Conversation',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      mode,
    };
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(id);
    return id;
  }, []);

  const setActiveConversation = useCallback((id: string) => {
    setActiveConversationId(id);
  }, []);

  const addMessage = useCallback((
    conversationId: string,
    messageData: Omit<Message, 'id' | 'timestamp'>
  ): Message => {
    const message: Message = {
      ...messageData,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };

    setConversations(prev =>
      prev.map(conv => {
        if (conv.id !== conversationId) return conv;

        // Auto-title from first user message
        let title = conv.title;
        if (conv.messages.length === 0 && messageData.role === 'user') {
          title = messageData.content.slice(0, 50) + (messageData.content.length > 50 ? '...' : '');
        }

        return {
          ...conv,
          title,
          messages: [...conv.messages, message],
          updatedAt: new Date(),
        };
      })
    );

    return message;
  }, []);

  const updateMessage = useCallback((
    conversationId: string,
    messageId: string,
    updates: Partial<Message>
  ) => {
    setConversations(prev =>
      prev.map(conv => {
        if (conv.id !== conversationId) return conv;
        return {
          ...conv,
          messages: conv.messages.map(msg =>
            msg.id === messageId ? { ...msg, ...updates } : msg
          ),
          updatedAt: new Date(),
        };
      })
    );
  }, []);

  const deleteConversation = useCallback((id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    setActiveConversationId(prev => (prev === id ? null : prev));
  }, []);

  const clearAll = useCallback(() => {
    setConversations([]);
    setActiveConversationId(null);
  }, []);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversationId,
        isLoading,
        streamingContent,
        activeConversation,
        createConversation,
        setActiveConversation,
        addMessage,
        updateMessage,
        deleteConversation,
        clearAll,
        setIsLoading,
        setStreamingContent,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}
