/**
 * PrivateHttpEngine
 *
 * Central HTTP communication layer for Lzainova AI.
 * All network requests go through this engine.
 * No component should call external APIs directly.
 *
 * Architecture:
 * App → PrivateHttpEngine → API Gateway → Agent Engine → Tools/Models/Memory
 *
 * Integration Status:
 * - Backend: Requires OnSpace Cloud or custom backend server
 * - AI Provider: Requires OnSpace AI (enable_onspace_cloud)
 * - Web Search: Requires Brave Search API key on backend
 */

import { API_CONFIG } from '@/constants/config';

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
  stream?: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}

export interface StreamCallback {
  onChunk: (chunk: string) => void;
  onComplete: (fullContent: string) => void;
  onError: (error: string) => void;
}

class PrivateHttpEngine {
  private baseUrl: string;
  private authToken: string | null = null;
  private requestQueue: Array<() => Promise<void>> = [];
  private isProcessingQueue = false;

  constructor() {
    this.baseUrl = API_CONFIG.baseUrl;
  }

  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  private getHeaders(extra?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Client': 'Lzainova-AI-Android',
      'X-Version': '1.0.0',
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return { ...headers, ...extra };
  }

  async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    if (!this.baseUrl) {
      return {
        success: false,
        error: 'Backend not configured. Please enable OnSpace Cloud.',
      };
    }

    const url = `${this.baseUrl}${endpoint}`;
    const timeout = options.timeout || 30000;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        method: options.method || 'GET',
        headers: this.getHeaders(options.headers),
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: errorText || `HTTP ${response.status}`,
          statusCode: response.status,
        };
      }

      const data = await response.json();
      return { success: true, data, statusCode: response.status };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error';
      return { success: false, error: msg };
    }
  }

  async streamRequest(
    endpoint: string,
    body: unknown,
    callbacks: StreamCallback
  ): Promise<void> {
    if (!this.baseUrl) {
      callbacks.onError('Backend not configured. Please enable OnSpace Cloud.');
      return;
    }

    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders({ Accept: 'text/event-stream' }),
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        callbacks.onError(`HTTP ${response.status}`);
        return;
      }

      let fullContent = '';
      const reader = response.body?.getReader();

      if (reader) {
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content || parsed.content || '';
                if (content) {
                  fullContent += content;
                  callbacks.onChunk(content);
                }
              } catch {
                // Non-JSON chunk
              }
            }
          }
        }
        callbacks.onComplete(fullContent);
      } else {
        const text = await response.text();
        callbacks.onComplete(text);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Stream error';
      callbacks.onError(msg);
    }
  }

  // === API Service Methods ===

  async sendMessage(params: {
    conversationId: string;
    message: string;
    mode: string;
    model?: string;
    history?: Array<{ role: string; content: string }>;
  }) {
    return this.request('/api/v1/chat/message', {
      method: 'POST',
      body: params,
    });
  }

  async streamMessage(
    params: {
      conversationId: string;
      message: string;
      mode: string;
      model?: string;
      history?: Array<{ role: string; content: string }>;
    },
    callbacks: StreamCallback
  ) {
    return this.streamRequest('/api/v1/chat/stream', params, callbacks);
  }

  async createAgentTask(params: {
    title: string;
    description: string;
    mode: string;
    projectId?: string;
  }) {
    return this.request('/api/v1/agent/task', {
      method: 'POST',
      body: params,
    });
  }

  async executeWorkflowStep(params: {
    taskId: string;
    stepId: string;
    tool?: string;
    input?: unknown;
  }) {
    return this.request('/api/v1/agent/step/execute', {
      method: 'POST',
      body: params,
    });
  }

  async webSearch(query: string, options?: { maxResults?: number }) {
    return this.request('/api/v1/search', {
      method: 'POST',
      body: { query, ...options },
    });
  }

  async uploadFile(projectId: string, filename: string, content: string) {
    return this.request('/api/v1/files/upload', {
      method: 'POST',
      body: { projectId, filename, content },
    });
  }

  async getMemory(userId: string, type?: string) {
    return this.request(`/api/v1/memory/${userId}${type ? `?type=${type}` : ''}`);
  }

  async saveMemory(userId: string, key: string, value: unknown, type: string) {
    return this.request('/api/v1/memory', {
      method: 'POST',
      body: { userId, key, value, type },
    });
  }

  async deleteMemory(userId: string, key: string) {
    return this.request(`/api/v1/memory/${userId}/${key}`, {
      method: 'DELETE',
    });
  }

  async executeSandbox(params: {
    command: string;
    workingDir?: string;
    timeout?: number;
    projectId?: string;
  }) {
    return this.request('/api/v1/sandbox/execute', {
      method: 'POST',
      body: params,
      timeout: (params.timeout || 30000) + 5000,
    });
  }

  async getHealth() {
    return this.request('/api/v1/health');
  }
}

// Singleton instance
export const httpEngine = new PrivateHttpEngine();
export default httpEngine;
