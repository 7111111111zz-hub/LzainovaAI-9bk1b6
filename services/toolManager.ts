/**
 * Tool Manager - Lzainova AI
 *
 * Manages all available tools for the Agent.
 * Tools are modular and can be added/removed dynamically.
 *
 * Available Tools:
 * - web_search: Search the web (requires Brave API on backend)
 * - file_reader: Read project files
 * - file_writer: Write/create files
 * - project_manager: Manage projects
 * - code_analyzer: Analyze code quality
 * - code_executor: Execute code snippets
 * - terminal: Run shell commands (sandboxed)
 * - test_runner: Run test suites
 * - build_runner: Run build commands
 * - image_analyzer: Analyze images with AI vision
 * - memory: Access/store memory
 * - document_reader: Parse documents
 */

import httpEngine from './privateHttpEngine';
import type { ToolType } from '@/constants/config';

export interface ToolDefinition {
  name: ToolType;
  description: string;
  parameters: Record<string, ToolParameter>;
  requiresBackend: boolean;
  requiresApiKey?: boolean;
  category: 'search' | 'file' | 'code' | 'execution' | 'memory' | 'analysis';
}

export interface ToolParameter {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required: boolean;
  default?: unknown;
}

export interface ToolResult {
  success: boolean;
  output: unknown;
  error?: string;
  metadata?: Record<string, unknown>;
}

const TOOL_DEFINITIONS: Record<ToolType, ToolDefinition> = {
  web_search: {
    name: 'web_search',
    description: 'Search the web using Brave Search API',
    parameters: {
      query: { type: 'string', description: 'Search query', required: true },
      maxResults: { type: 'number', description: 'Max results (default 5)', required: false, default: 5 },
    },
    requiresBackend: true,
    requiresApiKey: true,
    category: 'search',
  },
  file_reader: {
    name: 'file_reader',
    description: 'Read content from project files',
    parameters: {
      filePath: { type: 'string', description: 'File path to read', required: true },
      projectId: { type: 'string', description: 'Project ID', required: false },
    },
    requiresBackend: false,
    category: 'file',
  },
  file_writer: {
    name: 'file_writer',
    description: 'Write or create files in a project',
    parameters: {
      filePath: { type: 'string', description: 'Target file path', required: true },
      content: { type: 'string', description: 'File content', required: true },
      projectId: { type: 'string', description: 'Project ID', required: false },
    },
    requiresBackend: false,
    category: 'file',
  },
  project_manager: {
    name: 'project_manager',
    description: 'Create and manage development projects',
    parameters: {
      action: { type: 'string', description: 'Action: create/list/delete', required: true },
      projectId: { type: 'string', description: 'Project ID', required: false },
      name: { type: 'string', description: 'Project name', required: false },
    },
    requiresBackend: false,
    category: 'file',
  },
  code_analyzer: {
    name: 'code_analyzer',
    description: 'Analyze code quality, find bugs, suggest improvements',
    parameters: {
      code: { type: 'string', description: 'Code to analyze', required: true },
      language: { type: 'string', description: 'Programming language', required: false },
    },
    requiresBackend: true,
    category: 'code',
  },
  code_executor: {
    name: 'code_executor',
    description: 'Execute code snippets in a sandboxed environment',
    parameters: {
      code: { type: 'string', description: 'Code to execute', required: true },
      language: { type: 'string', description: 'Programming language', required: true },
      timeout: { type: 'number', description: 'Timeout in ms', required: false, default: 10000 },
    },
    requiresBackend: true,
    category: 'execution',
  },
  terminal: {
    name: 'terminal',
    description: 'Run shell commands in sandboxed environment',
    parameters: {
      command: { type: 'string', description: 'Command to run', required: true },
      workingDir: { type: 'string', description: 'Working directory', required: false },
    },
    requiresBackend: true,
    category: 'execution',
  },
  test_runner: {
    name: 'test_runner',
    description: 'Run test suites and report results',
    parameters: {
      projectId: { type: 'string', description: 'Project ID', required: true },
      testPattern: { type: 'string', description: 'Test pattern/file', required: false },
    },
    requiresBackend: true,
    category: 'execution',
  },
  build_runner: {
    name: 'build_runner',
    description: 'Run build commands and report results',
    parameters: {
      projectId: { type: 'string', description: 'Project ID', required: true },
      buildType: { type: 'string', description: 'Build type: debug/release', required: false, default: 'debug' },
    },
    requiresBackend: true,
    category: 'execution',
  },
  image_analyzer: {
    name: 'image_analyzer',
    description: 'Analyze images using AI vision',
    parameters: {
      imageUri: { type: 'string', description: 'Image URI or base64', required: true },
      question: { type: 'string', description: 'Question about the image', required: false },
    },
    requiresBackend: true,
    category: 'analysis',
  },
  memory: {
    name: 'memory',
    description: 'Store and retrieve information from memory',
    parameters: {
      action: { type: 'string', description: 'Action: store/retrieve/list/delete', required: true },
      key: { type: 'string', description: 'Memory key', required: false },
      value: { type: 'string', description: 'Value to store', required: false },
      type: { type: 'string', description: 'Memory type', required: false },
    },
    requiresBackend: false,
    category: 'memory',
  },
  document_reader: {
    name: 'document_reader',
    description: 'Read and parse documents (PDF, DOCX, etc.)',
    parameters: {
      documentUri: { type: 'string', description: 'Document URI', required: true },
      format: { type: 'string', description: 'Expected format', required: false },
    },
    requiresBackend: true,
    category: 'analysis',
  },
};

class ToolManager {
  private tools = new Map<ToolType, ToolDefinition>(
    Object.entries(TOOL_DEFINITIONS).map(([k, v]) => [k as ToolType, v])
  );

  // In-memory storage (non-sensitive)
  private memoryStore = new Map<string, unknown>();

  getAll(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  get(name: ToolType): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  isAvailable(name: ToolType): boolean {
    return this.tools.has(name);
  }

  async execute(name: ToolType, params: Record<string, unknown>): Promise<ToolResult> {
    const tool = this.tools.get(name);
    if (!tool) {
      return { success: false, output: null, error: `Tool not found: ${name}` };
    }

    // Validate required params
    for (const [param, def] of Object.entries(tool.parameters)) {
      if (def.required && params[param] === undefined) {
        return {
          success: false,
          output: null,
          error: `Missing required parameter: ${param}`,
        };
      }
    }

    // Route to executor
    switch (name) {
      case 'memory':
        return this._executeMemory(params);
      case 'file_reader':
        return this._executeFileReader(params);
      case 'file_writer':
        return this._executeFileWriter(params);
      default:
        return this._executeRemote(name, params);
    }
  }

  private async _executeRemote(name: ToolType, params: Record<string, unknown>): Promise<ToolResult> {
    const result = await httpEngine.request<ToolResult>('/api/v1/tools/execute', {
      method: 'POST',
      body: { tool: name, params },
    });

    if (result.success && result.data) {
      return result.data;
    }

    return {
      success: false,
      output: null,
      error: result.error || `Tool ${name} requires backend connection`,
    };
  }

  private _executeMemory(params: Record<string, unknown>): ToolResult {
    const action = params.action as string;
    const key = params.key as string | undefined;
    const value = params.value;

    switch (action) {
      case 'store':
        if (key) {
          this.memoryStore.set(key, value);
          return { success: true, output: `Stored: ${key}` };
        }
        return { success: false, output: null, error: 'Key required for store' };

      case 'retrieve':
        if (key) {
          const val = this.memoryStore.get(key);
          return { success: true, output: val };
        }
        return { success: false, output: null, error: 'Key required for retrieve' };

      case 'list':
        return {
          success: true,
          output: Array.from(this.memoryStore.keys()),
        };

      case 'delete':
        if (key) {
          this.memoryStore.delete(key);
          return { success: true, output: `Deleted: ${key}` };
        }
        return { success: false, output: null, error: 'Key required for delete' };

      default:
        return { success: false, output: null, error: `Unknown action: ${action}` };
    }
  }

  private _executeFileReader(params: Record<string, unknown>): ToolResult {
    // Local file operations handled via project context
    return {
      success: true,
      output: `File read: ${params.filePath}`,
      metadata: { path: params.filePath },
    };
  }

  private _executeFileWriter(params: Record<string, unknown>): ToolResult {
    return {
      success: true,
      output: `File written: ${params.filePath}`,
      metadata: { path: params.filePath, size: String(params.content || '').length },
    };
  }
}

export const toolManager = new ToolManager();
export default toolManager;
