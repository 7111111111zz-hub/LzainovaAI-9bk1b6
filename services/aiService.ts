/**
 * AI Service - Lzainova AI
 *
 * Handles AI model communication.
 * Uses OnSpace AI as the primary provider.
 *
 * Integration Status:
 * - OnSpace AI: Ready when OnSpace Cloud is enabled
 * - Fallback: Local response simulation for development
 *
 * To enable real AI:
 * 1. Enable OnSpace Cloud via enable_onspace_cloud tool
 * 2. Configure AI model in Settings
 * 3. Responses will be real AI-generated content
 */

import httpEngine from './privateHttpEngine';
import type { AgentMode } from '@/constants/config';
import type { Message } from '@/contexts/ChatContext';

export interface AiRequest {
  message: string;
  mode: AgentMode;
  conversationId: string;
  history?: Array<{ role: string; content: string }>;
  model?: string;
  systemPrompt?: string;
  tools?: string[];
  projectContext?: string;
}

export interface AiResponse {
  content: string;
  model: string;
  toolCalls?: Array<{ tool: string; input: Record<string, unknown>; output?: string }>;
  searchSources?: Array<{ title: string; url: string; snippet: string }>;
  tokens?: { prompt: number; completion: number };
  isComplete: boolean;
  error?: string;
}

export interface StreamCallbacks {
  onToken: (token: string) => void;
  onToolCall?: (tool: string, input: Record<string, unknown>) => void;
  onSearchSources?: (sources: Array<{ title: string; url: string; snippet: string }>) => void;
  onComplete: (response: AiResponse) => void;
  onError: (error: string) => void;
}

const SYSTEM_PROMPTS: Record<AgentMode, string> = {
  chat: `You are Lzainova AI, a private and autonomous AI assistant. 
Be helpful, accurate, and concise. 
Tagline: "Private. Autonomous. Yours."
Always be honest about your capabilities and limitations.`,

  code: `You are Lzainova AI in Code mode. 
You are an expert software engineer specializing in analyzing, writing, debugging, and optimizing code.
Always provide working, production-quality code with explanations.
Use proper formatting with code blocks.
Identify potential bugs and suggest improvements.`,

  task: `You are Lzainova AI in Task mode.
You are an autonomous agent that can break down complex tasks and execute them step by step.
For each task, provide a clear plan with steps, execute them systematically, and verify results.
Report progress clearly and handle errors gracefully.`,

  vision: `You are Lzainova AI in Vision mode.
You can analyze images, diagrams, screenshots, and visual content.
Provide detailed, accurate analysis of visual content.`,

  memory: `You are Lzainova AI in Memory mode.
Help users manage their stored information, preferences, and notes.
Recall and organize information clearly.`,
};

class AiService {
  private isBackendAvailable = false;
  private lastHealthCheck = 0;
  private healthCheckInterval = 30000;

  async checkBackendHealth(): Promise<boolean> {
    const now = Date.now();
    if (now - this.lastHealthCheck < this.healthCheckInterval) {
      return this.isBackendAvailable;
    }

    const result = await httpEngine.getHealth();
    this.isBackendAvailable = result.success;
    this.lastHealthCheck = now;
    return this.isBackendAvailable;
  }

  buildHistory(messages: Message[]): Array<{ role: string; content: string }> {
    return messages
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .slice(-20) // Last 20 messages for context
      .map(m => ({ role: m.role, content: m.content }));
  }

  async sendMessage(
    request: AiRequest,
    callbacks: StreamCallbacks
  ): Promise<void> {
    const isAvailable = await this.checkBackendHealth();

    if (!isAvailable) {
      // Use local AI simulation
      this._simulateAiResponse(request, callbacks);
      return;
    }

    // Stream from backend
    const systemPrompt = request.systemPrompt || SYSTEM_PROMPTS[request.mode];

    await httpEngine.streamRequest(
      '/api/v1/ai/stream',
      {
        message: request.message,
        mode: request.mode,
        conversationId: request.conversationId,
        history: request.history,
        model: request.model || 'lzainova-pro',
        systemPrompt,
        tools: request.tools,
        projectContext: request.projectContext,
      },
      {
        onChunk: (chunk: string) => {
          callbacks.onToken(chunk);
        },
        onComplete: (fullContent: string) => {
          callbacks.onComplete({
            content: fullContent,
            model: request.model || 'lzainova-pro',
            isComplete: true,
          });
        },
        onError: (error: string) => {
          callbacks.onError(error);
        },
      }
    );
  }

  private _simulateAiResponse(
    request: AiRequest,
    callbacks: StreamCallbacks
  ): void {
    const responses = this._generateLocalResponse(request.message, request.mode);

    let index = 0;
    const words = responses.split(' ');

    const stream = setInterval(() => {
      if (index >= words.length) {
        clearInterval(stream);
        callbacks.onComplete({
          content: responses,
          model: 'lzainova-local',
          isComplete: true,
        });
        return;
      }

      const chunk = (index === 0 ? '' : ' ') + words[index];
      callbacks.onToken(chunk);
      index++;
    }, 40);
  }

  private _generateLocalResponse(message: string, mode: AgentMode): string {
    const lower = message.toLowerCase();

    if (mode === 'code' || lower.includes('code') || lower.includes('function') || lower.includes('app')) {
      return `I'm ready to help you with code! 🔵

**Backend Connection Required**

To provide real AI-powered code assistance, I need to connect to the Lzainova AI backend.

**What to do:**
1. Enable **OnSpace Cloud** in the settings
2. Configure your AI model
3. I'll then provide full code generation, analysis, and debugging

**I can help you with:**
- Writing complete applications
- Code review and optimization
- Debugging and error fixing
- Architecture design
- ${message.includes('android') ? 'Android app development with Kotlin/Java' : 'Any programming language'}

*Note: This is a local fallback response. Enable the backend for full AI capabilities.*`;
    }

    if (lower.includes('hello') || lower.includes('hi') || lower.includes('مرحبا') || lower.includes('السلام')) {
      return `مرحباً! I'm **Lzainova AI** — your private, autonomous AI assistant.

I'm currently running in **local mode**. For full AI capabilities including:
- Real-time intelligent responses
- Code generation & analysis  
- Task execution with multiple agents
- Web search integration
- Memory persistence

Please **enable OnSpace Cloud** to unlock all features.

What can I help you think through today?`;
    }

    if (lower.includes('task') || lower.includes('build') || lower.includes('create') || lower.includes('مهمة')) {
      return `I understand you want to work on a task!

**Task Mode Activated** 🟡

I can break this into structured steps:

1. **Analyze requirements** — Understanding what you need
2. **Plan execution** — Creating a step-by-step plan  
3. **Execute steps** — Running each phase systematically
4. **Verify results** — Checking quality and correctness
5. **Deliver** — Presenting the final result

**Note:** Full task execution with real code generation requires the backend connection. Enable **OnSpace Cloud** to run complete agent workflows.

Would you like me to start planning this task in detail?`;
    }

    return `I'm **Lzainova AI** — *Private. Autonomous. Yours.*

You asked: "${message}"

I'm currently in **local mode** without a backend connection. My responses are limited to pre-defined patterns.

**To get real AI responses:**
1. Enable OnSpace Cloud backend
2. Connect to the Lzainova AI engine
3. Get intelligent, contextual responses powered by advanced AI models

I'm ready to assist with:
- 💬 **Chat**: General questions and conversation
- 🔵 **Code**: Writing, analyzing, and debugging code
- 🟡 **Task**: Complex multi-step agent workflows  
- 🟢 **Vision**: Image and document analysis
- 🔵 **Memory**: Personal knowledge management

*This response is a local simulation. Enable the backend for the full experience.*`;
  }
}

export const aiService = new AiService();
export default aiService;
