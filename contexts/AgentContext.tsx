import React, { createContext, useState, useCallback, ReactNode } from 'react';
import type { StepStatus } from '@/constants/config';

export interface TaskStep {
  id: string;
  name: string;
  status: StepStatus;
  details?: string;
  startTime?: Date;
  endTime?: Date;
  output?: string;
  error?: string;
  subSteps?: TaskStep[];
}

export interface AgentTask {
  id: string;
  title: string;
  description: string;
  steps: TaskStep[];
  status: 'idle' | 'planning' | 'running' | 'paused' | 'done' | 'failed';
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  conversationId?: string;
  projectId?: string;
  logs: LogEntry[];
  result?: string;
  error?: string;
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'success' | 'command';
  message: string;
  data?: unknown;
}

export interface WorkflowNode {
  id: string;
  type: 'step' | 'condition' | 'parallel' | 'loop' | 'retry';
  name: string;
  status: StepStatus;
  children?: WorkflowNode[];
  condition?: string;
  maxRetries?: number;
  currentRetry?: number;
}

interface AgentContextType {
  tasks: AgentTask[];
  activeTaskId: string | null;
  activeTask: AgentTask | null;
  workflowNodes: WorkflowNode[];
  isAgentRunning: boolean;
  createTask: (title: string, description: string, steps: Omit<TaskStep, 'id' | 'status'>[]) => AgentTask;
  updateTaskStep: (taskId: string, stepId: string, updates: Partial<TaskStep>) => void;
  updateTaskStatus: (taskId: string, status: AgentTask['status']) => void;
  addTaskLog: (taskId: string, level: LogEntry['level'], message: string, data?: unknown) => void;
  setActiveTask: (id: string | null) => void;
  setWorkflowNodes: (nodes: WorkflowNode[]) => void;
  completeTask: (taskId: string, result: string) => void;
  failTask: (taskId: string, error: string) => void;
}

export const AgentContext = createContext<AgentContextType | undefined>(undefined);

export function AgentProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [activeTaskId, setActiveTaskIdState] = useState<string | null>(null);
  const [workflowNodes, setWorkflowNodes] = useState<WorkflowNode[]>([]);
  const [isAgentRunning, setIsAgentRunning] = useState(false);

  const activeTask = tasks.find(t => t.id === activeTaskId) || null;

  const createTask = useCallback((
    title: string,
    description: string,
    steps: Omit<TaskStep, 'id' | 'status'>[]
  ): AgentTask => {
    const task: AgentTask = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      description,
      steps: steps.map((s, i) => ({
        ...s,
        id: `step_${i}_${Date.now()}`,
        status: 'pending',
      })),
      status: 'idle',
      createdAt: new Date(),
      logs: [],
    };
    setTasks(prev => [task, ...prev]);
    setActiveTaskIdState(task.id);
    return task;
  }, []);

  const updateTaskStep = useCallback((
    taskId: string,
    stepId: string,
    updates: Partial<TaskStep>
  ) => {
    setTasks(prev =>
      prev.map(task => {
        if (task.id !== taskId) return task;
        return {
          ...task,
          steps: task.steps.map(step =>
            step.id === stepId ? { ...step, ...updates } : step
          ),
        };
      })
    );
  }, []);

  const updateTaskStatus = useCallback((taskId: string, status: AgentTask['status']) => {
    setTasks(prev =>
      prev.map(task => {
        if (task.id !== taskId) return task;
        const updates: Partial<AgentTask> = { status };
        if (status === 'running' && !task.startedAt) updates.startedAt = new Date();
        return { ...task, ...updates };
      })
    );
    setIsAgentRunning(status === 'running' || status === 'planning');
  }, []);

  const addTaskLog = useCallback((
    taskId: string,
    level: LogEntry['level'],
    message: string,
    data?: unknown
  ) => {
    const log: LogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date(),
      level,
      message,
      data,
    };
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId
          ? { ...task, logs: [...task.logs, log] }
          : task
      )
    );
  }, []);

  const setActiveTask = useCallback((id: string | null) => {
    setActiveTaskIdState(id);
  }, []);

  const completeTask = useCallback((taskId: string, result: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId
          ? { ...task, status: 'done', result, completedAt: new Date() }
          : task
      )
    );
    setIsAgentRunning(false);
  }, []);

  const failTask = useCallback((taskId: string, error: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId
          ? { ...task, status: 'failed', error, completedAt: new Date() }
          : task
      )
    );
    setIsAgentRunning(false);
  }, []);

  return (
    <AgentContext.Provider
      value={{
        tasks,
        activeTaskId,
        activeTask,
        workflowNodes,
        isAgentRunning,
        createTask,
        updateTaskStep,
        updateTaskStatus,
        addTaskLog,
        setActiveTask,
        setWorkflowNodes,
        completeTask,
        failTask,
      }}
    >
      {children}
    </AgentContext.Provider>
  );
}
