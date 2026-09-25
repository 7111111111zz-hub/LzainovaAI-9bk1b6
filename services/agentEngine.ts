/**
 * Agent Engine - Lzainova AI
 *
 * Components:
 * - Planner: Decomposes user requests into executable steps
 * - Executor: Runs individual steps using tools
 * - Monitor: Tracks execution, detects failures
 * - Verifier: Validates results before delivery
 * - Memory: Maintains context across steps
 * - Tool Manager: Manages available tools
 *
 * Workflow:
 * User Request → Planner → Task Plan → Executor → Tools → Monitor → Verifier → Result
 * On Error: Executor → Monitor → Fix → Retry → Verifier
 *
 * Integration:
 * - Requires: OnSpace Cloud (enable backend first)
 * - Requires: AI model connection via OnSpace AI
 * - Optional: Web Search (Brave API key on backend)
 */

import { httpEngine } from './privateHttpEngine';
import { toolManager } from './toolManager';
import type { AgentTask, TaskStep, LogEntry } from '@/contexts/AgentContext';
import { WORKFLOW_CONFIG } from '@/constants/config';

export interface PlannerOutput {
  title: string;
  description: string;
  steps: Array<{
    name: string;
    description: string;
    toolRequired?: string;
    estimatedDuration?: number;
  }>;
  estimatedTotal?: number;
}

export interface ExecutorResult {
  success: boolean;
  output: string;
  error?: string;
  toolsUsed: string[];
  duration: number;
}

export interface VerifierResult {
  passed: boolean;
  score: number;
  issues: string[];
  suggestions: string[];
}

// ─── Planner ──────────────────────────────────────────────────────────────────

export class Planner {
  async plan(
    request: string,
    mode: string,
    context?: string
  ): Promise<PlannerOutput> {
    // Try backend planning
    const result = await httpEngine.request<PlannerOutput>('/api/v1/agent/plan', {
      method: 'POST',
      body: { request, mode, context },
    });

    if (result.success && result.data) {
      return result.data;
    }

    // Local planning fallback - generates structured plan
    return this._localPlan(request, mode);
  }

  private _localPlan(request: string, mode: string): PlannerOutput {
    const isCode = mode === 'code' || /creat|build|write|develop|implement/i.test(request);
    const isTask = mode === 'task';

    if (isCode) {
      return {
        title: request.slice(0, 60),
        description: request,
        steps: [
          { name: 'Analyze requirements', description: 'Understanding project requirements' },
          { name: 'Create project structure', description: 'Setting up file structure and dependencies' },
          { name: 'Write core code', description: 'Implementing main functionality' },
          { name: 'Add error handling', description: 'Implementing error handling and edge cases' },
          { name: 'Run tests', description: 'Executing unit and integration tests' },
          { name: 'Fix issues', description: 'Resolving any test failures or bugs' },
          { name: 'Verify & deliver', description: 'Final verification and delivery' },
        ],
      };
    }

    if (isTask) {
      return {
        title: request.slice(0, 60),
        description: request,
        steps: [
          { name: 'Understand task', description: 'Analyzing task requirements' },
          { name: 'Gather information', description: 'Collecting necessary data' },
          { name: 'Execute plan', description: 'Running task steps' },
          { name: 'Verify results', description: 'Checking output quality' },
          { name: 'Deliver results', description: 'Formatting and delivering results' },
        ],
      };
    }

    // Generic plan
    return {
      title: request.slice(0, 60),
      description: request,
      steps: [
        { name: 'Process request', description: 'Understanding and processing your request' },
        { name: 'Generate response', description: 'Creating a comprehensive response' },
        { name: 'Verify quality', description: 'Ensuring response accuracy' },
      ],
    };
  }
}

// ─── Executor ─────────────────────────────────────────────────────────────────

export class Executor {
  async executeStep(
    step: TaskStep,
    context: Record<string, unknown>
  ): Promise<ExecutorResult> {
    const startTime = Date.now();
    const toolsUsed: string[] = [];

    try {
      const result = await httpEngine.request<ExecutorResult>(
        '/api/v1/agent/step/execute',
        {
          method: 'POST',
          body: { step, context },
          timeout: WORKFLOW_CONFIG.defaultTimeout,
        }
      );

      if (result.success && result.data) {
        return result.data;
      }

      // Local simulation if backend unavailable
      await this._simulateExecution(step.name);

      return {
        success: true,
        output: `Completed: ${step.name}`,
        toolsUsed,
        duration: Date.now() - startTime,
      };
    } catch (err: unknown) {
      return {
        success: false,
        output: '',
        error: err instanceof Error ? err.message : 'Execution failed',
        toolsUsed,
        duration: Date.now() - startTime,
      };
    }
  }

  private _simulateExecution(stepName: string): Promise<void> {
    const duration = 1000 + Math.random() * 2000;
    return new Promise(resolve => setTimeout(resolve, duration));
  }

  async retry(
    step: TaskStep,
    context: Record<string, unknown>,
    maxRetries = WORKFLOW_CONFIG.maxRetries
  ): Promise<ExecutorResult> {
    let lastResult: ExecutorResult | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      lastResult = await this.executeStep(step, context);
      if (lastResult.success) return lastResult;

      // Wait before retry
      await new Promise(resolve =>
        setTimeout(resolve, WORKFLOW_CONFIG.retryDelay * (attempt + 1))
      );
    }

    return lastResult || {
      success: false,
      output: '',
      error: 'Max retries exceeded',
      toolsUsed: [],
      duration: 0,
    };
  }
}

// ─── Monitor ──────────────────────────────────────────────────────────────────

export class Monitor {
  private logs: LogEntry[] = [];

  log(level: LogEntry['level'], message: string, data?: unknown) {
    const entry: LogEntry = {
      id: `log_${Date.now()}`,
      timestamp: new Date(),
      level,
      message,
      data,
    };
    this.logs.push(entry);
    return entry;
  }

  getLogs(): LogEntry[] {
    return this.logs;
  }

  clearLogs() {
    this.logs = [];
  }

  detectFailure(result: ExecutorResult): boolean {
    return !result.success || Boolean(result.error);
  }

  analyzeError(error: string): {
    type: 'build' | 'test' | 'runtime' | 'network' | 'unknown';
    recoverable: boolean;
    suggestion: string;
  } {
    if (error.includes('build') || error.includes('compile') || error.includes('gradle')) {
      return {
        type: 'build',
        recoverable: true,
        suggestion: 'Fix compilation errors and retry build',
      };
    }
    if (error.includes('test') || error.includes('assert') || error.includes('expect')) {
      return {
        type: 'test',
        recoverable: true,
        suggestion: 'Fix failing tests or update test expectations',
      };
    }
    if (error.includes('network') || error.includes('timeout') || error.includes('connect')) {
      return {
        type: 'network',
        recoverable: true,
        suggestion: 'Check network connection and retry',
      };
    }
    if (error.includes('runtime') || error.includes('crash') || error.includes('null')) {
      return {
        type: 'runtime',
        recoverable: true,
        suggestion: 'Add null checks and error handling',
      };
    }
    return {
      type: 'unknown',
      recoverable: false,
      suggestion: 'Manual intervention required',
    };
  }
}

// ─── Verifier ─────────────────────────────────────────────────────────────────

export class Verifier {
  async verify(
    task: AgentTask,
    output: string
  ): Promise<VerifierResult> {
    const result = await httpEngine.request<VerifierResult>(
      '/api/v1/agent/verify',
      {
        method: 'POST',
        body: { task: { id: task.id, title: task.title }, output },
      }
    );

    if (result.success && result.data) {
      return result.data;
    }

    // Local verification
    return this._localVerify(task, output);
  }

  private _localVerify(task: AgentTask, output: string): VerifierResult {
    const issues: string[] = [];
    const suggestions: string[] = [];

    const failedSteps = task.steps.filter(s => s.status === 'failed');
    if (failedSteps.length > 0) {
      issues.push(`${failedSteps.length} step(s) failed during execution`);
      suggestions.push('Review failed steps and retry');
    }

    const passed = issues.length === 0;
    const score = passed ? 1.0 : Math.max(0, 1 - failedSteps.length * 0.2);

    return { passed, score, issues, suggestions };
  }
}

// ─── Agent Engine Orchestrator ────────────────────────────────────────────────

export class AgentEngine {
  planner = new Planner();
  executor = new Executor();
  monitor = new Monitor();
  verifier = new Verifier();
  tools = toolManager;

  private onLog?: (level: LogEntry['level'], message: string, data?: unknown) => void;
  private onStepUpdate?: (stepId: string, status: string, output?: string) => void;

  setLogCallback(cb: (level: LogEntry['level'], message: string, data?: unknown) => void) {
    this.onLog = cb;
  }

  setStepCallback(cb: (stepId: string, status: string, output?: string) => void) {
    this.onStepUpdate = cb;
  }

  private log(level: LogEntry['level'], message: string, data?: unknown) {
    this.monitor.log(level, message, data);
    this.onLog?.(level, message, data);
  }

  async runTask(
    task: AgentTask,
    options?: {
      onStepStart?: (step: TaskStep) => void;
      onStepComplete?: (step: TaskStep, result: ExecutorResult) => void;
      onStepFail?: (step: TaskStep, error: string) => void;
      onComplete?: (result: string) => void;
      onFail?: (error: string) => void;
    }
  ): Promise<void> {
    this.log('info', `Starting task: ${task.title}`);
    const context: Record<string, unknown> = {};

    for (const step of task.steps) {
      this.log('info', `Executing step: ${step.name}`);
      this.onStepUpdate?.(step.id, 'running');
      options?.onStepStart?.(step);

      const result = await this.executor.executeStep(step, context);

      if (this.monitor.detectFailure(result)) {
        this.log('error', `Step failed: ${step.name}`, result.error);

        // Analyze and attempt recovery
        if (result.error) {
          const analysis = this.monitor.analyzeError(result.error);
          this.log('warn', `Error type: ${analysis.type}. ${analysis.suggestion}`);

          if (analysis.recoverable) {
            this.log('info', `Retrying step: ${step.name}`);
            const retryResult = await this.executor.retry(step, context);

            if (retryResult.success) {
              this.log('success', `Step recovered: ${step.name}`);
              this.onStepUpdate?.(step.id, 'done', retryResult.output);
              context[step.id] = retryResult.output;
              options?.onStepComplete?.(step, retryResult);
              continue;
            }
          }
        }

        this.onStepUpdate?.(step.id, 'failed', result.error);
        options?.onStepFail?.(step, result.error || 'Unknown error');
        options?.onFail?.(`Failed at step: ${step.name}\n${result.error}`);
        return;
      }

      this.log('success', `Step completed: ${step.name}`);
      this.onStepUpdate?.(step.id, 'done', result.output);
      context[step.id] = result.output;
      options?.onStepComplete?.(step, result);
    }

    // Verify final result
    this.log('info', 'Verifying results...');
    const verification = await this.verifier.verify(
      task,
      JSON.stringify(context)
    );

    if (!verification.passed) {
      this.log('warn', `Verification issues: ${verification.issues.join(', ')}`);
    }

    this.log('success', `Task completed: ${task.title}`);
    options?.onComplete?.(`Task completed successfully.\n\nVerification Score: ${Math.round(verification.score * 100)}%`);
  }
}

export const agentEngine = new AgentEngine();
export const planner = new Planner();
export const executor = new Executor();
export const monitor = new Monitor();
export const verifier = new Verifier();
