// Lzainova AI - App Configuration

export const APP_CONFIG = {
  name: 'Lzainova AI',
  tagline: 'Private. Autonomous. Yours.',
  version: '1.0.0',
  buildNumber: 1,
};

// Agent Modes
export type AgentMode = 'chat' | 'code' | 'task' | 'vision' | 'memory';

export const AGENT_MODES: AgentMode[] = ['chat', 'code', 'task', 'vision', 'memory'];

export const MODE_COLORS = {
  chat: '#3B82F6',
  code: '#8B5CF6',
  task: '#F59E0B',
  vision: '#10B981',
  memory: '#06B6D4',
};

export const MODE_ICONS = {
  chat: 'chat-bubble-outline',
  code: 'code',
  task: 'assignment',
  vision: 'visibility',
  memory: 'memory',
};

// AI Models available
export const AI_MODELS = [
  { id: 'lzainova-pro', name: 'Lzainova Pro', description: 'Most capable' },
  { id: 'lzainova-fast', name: 'Lzainova Fast', description: 'Faster responses' },
  { id: 'lzainova-code', name: 'Lzainova Code', description: 'Optimized for code' },
];

// Tool definitions
export type ToolType =
  | 'web_search'
  | 'file_reader'
  | 'file_writer'
  | 'project_manager'
  | 'code_analyzer'
  | 'code_executor'
  | 'terminal'
  | 'test_runner'
  | 'build_runner'
  | 'image_analyzer'
  | 'memory'
  | 'document_reader';

export const AVAILABLE_TOOLS: ToolType[] = [
  'web_search',
  'file_reader',
  'file_writer',
  'project_manager',
  'code_analyzer',
  'code_executor',
  'terminal',
  'test_runner',
  'build_runner',
  'image_analyzer',
  'memory',
  'document_reader',
];

// Project types
export type ProjectType = 'android' | 'web' | 'api' | 'ml' | 'other';

// Task step statuses
export type StepStatus = 'pending' | 'running' | 'done' | 'failed' | 'skipped';

// Workflow step types
export type WorkflowStepType =
  | 'analyze'
  | 'plan'
  | 'execute'
  | 'verify'
  | 'retry'
  | 'condition'
  | 'parallel';

// Message roles
export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

// Memory types
export type MemoryType =
  | 'conversation'
  | 'project'
  | 'task'
  | 'preferences'
  | 'longterm';

// API Configuration (Backend integration points)
export const API_CONFIG = {
  // These would be set via environment or backend configuration
  baseUrl: process.env.EXPO_PUBLIC_API_URL || '',
  wsUrl: process.env.EXPO_PUBLIC_WS_URL || '',
  // Search provider config - key stays on backend
  searchProvider: 'brave',
  // AI engine
  aiProvider: 'onspace',
};

// Sandbox configuration
export const SANDBOX_CONFIG = {
  maxExecutionTime: 30000, // 30 seconds
  allowedCommands: [
    'gradlew',
    'npm',
    'npx',
    'python',
    'pytest',
    'jest',
    'cargo',
    'go',
  ],
  forbiddenCommands: ['rm -rf /', 'sudo rm', 'format', 'mkfs', 'dd if='],
};

// Workflow configuration
export const WORKFLOW_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  maxParallelTasks: 4,
  defaultTimeout: 60000,
};
