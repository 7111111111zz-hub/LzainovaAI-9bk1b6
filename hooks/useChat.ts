import { useContext, useCallback, useRef } from 'react';
import { ChatContext } from '@/contexts/ChatContext';
import { AgentContext } from '@/contexts/AgentContext';
import { AppContext } from '@/contexts/AppContext';
import { aiService } from '@/services/aiService';
import { agentEngine, Planner } from '@/services/agentEngine';
import type { AgentMode } from '@/constants/config';

export function useChat() {
  const chat = useContext(ChatContext);
  const agent = useContext(AgentContext);
  const app = useContext(AppContext);

  if (!chat) throw new Error('useChat must be used within ChatProvider');

  const abortRef = useRef<boolean>(false);

  const sendMessage = useCallback(async (
    content: string,
    mode?: AgentMode
  ) => {
    if (!content.trim()) return;

    const currentMode = mode || app?.activeMode || 'chat';
    abortRef.current = false;

    // Ensure active conversation exists
    let convId = chat.activeConversationId;
    if (!convId) {
      convId = chat.createConversation(currentMode);
    }

    // Add user message
    chat.addMessage(convId, {
      role: 'user',
      content: content.trim(),
      mode: currentMode,
    });

    chat.setIsLoading(true);
    chat.setStreamingContent('');

    // Add placeholder assistant message
    const assistantMsg = chat.addMessage(convId, {
      role: 'assistant',
      content: '',
      mode: currentMode,
      isStreaming: true,
    });

    // For Task mode, create an agent task
    if (currentMode === 'task' && agent) {
      const planner = new Planner();
      const plan = await planner.plan(content, currentMode);

      const task = agent.createTask(
        plan.title,
        plan.description,
        plan.steps
      );

      agent.updateTaskStatus(task.id, 'running');
      agent.addTaskLog(task.id, 'info', `Starting task: ${plan.title}`);

      // Run task in background
      agentEngine.setLogCallback((level, message, data) => {
        agent.addTaskLog(task.id, level, message, data);
      });
      agentEngine.setStepCallback((stepId, status, output) => {
        agent.updateTaskStep(task.id, stepId, {
          status: status as 'pending' | 'running' | 'done' | 'failed',
          output,
          ...(status === 'running' ? { startTime: new Date() } : {}),
          ...(status === 'done' || status === 'failed' ? { endTime: new Date() } : {}),
        });
      });

      agentEngine.runTask(task, {
        onComplete: (result) => {
          agent.completeTask(task.id, result);
          chat.updateMessage(convId!, assistantMsg.id, {
            content: `**Task Completed** ✓\n\n${result}\n\n*Task ID: ${task.id}*`,
            isStreaming: false,
          });
          chat.setIsLoading(false);
        },
        onFail: (error) => {
          agent.failTask(task.id, error);
          chat.updateMessage(convId!, assistantMsg.id, {
            content: `**⚠️ Task Failed**\n\n${error}\n\nPlease check the task details for more information.`,
            isStreaming: false,
            error,
          });
          chat.setIsLoading(false);
        },
      });

      // Initial response about the task
      chat.updateMessage(convId, assistantMsg.id, {
        content: `**Task Created** — Running agent...\n\n📋 **${plan.title}**\n\n**Steps:**\n${plan.steps.map((s, i) => `${i + 1}. ${s.name}`).join('\n')}\n\nOpen the Task panel to monitor progress.`,
        isStreaming: false,
      });
      chat.setIsLoading(false);
      return;
    }

    // For other modes, use AI service
    const history = chat.activeConversation?.messages
      .filter(m => !m.isStreaming && m.content)
      .slice(-20);

    let streamedContent = '';

    await aiService.sendMessage(
      {
        message: content,
        mode: currentMode,
        conversationId: convId,
        history: history ? aiService.buildHistory(history) : [],
      },
      {
        onToken: (token) => {
          if (abortRef.current) return;
          streamedContent += token;
          chat.setStreamingContent(streamedContent);
          chat.updateMessage(convId!, assistantMsg.id, {
            content: streamedContent,
            isStreaming: true,
          });
        },
        onSearchSources: (sources) => {
          chat.updateMessage(convId!, assistantMsg.id, {
            searchSources: sources,
          });
        },
        onComplete: (response) => {
          chat.updateMessage(convId!, assistantMsg.id, {
            content: response.content,
            isStreaming: false,
            searchSources: response.searchSources,
          });
          chat.setStreamingContent('');
          chat.setIsLoading(false);
        },
        onError: (error) => {
          chat.updateMessage(convId!, assistantMsg.id, {
            content: `⚠️ Error: ${error}`,
            isStreaming: false,
            error,
          });
          chat.setStreamingContent('');
          chat.setIsLoading(false);
        },
      }
    );
  }, [chat, agent, app]);

  const stopGeneration = useCallback(() => {
    abortRef.current = true;
    chat.setIsLoading(false);
    chat.setStreamingContent('');
  }, [chat]);

  return {
    ...chat,
    sendMessage,
    stopGeneration,
  };
}
