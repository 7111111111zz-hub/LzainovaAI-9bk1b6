import React, { createContext, useState, useCallback, ReactNode } from 'react';
import type { ProjectType } from '@/constants/config';

export interface ProjectFile {
  id: string;
  name: string;
  path: string;
  content: string;
  language: string;
  size: number;
  createdAt: Date;
  modifiedAt: Date;
}

export interface BuildResult {
  id: string;
  status: 'success' | 'failed' | 'running';
  stdout: string;
  stderr: string;
  exitCode: number;
  duration: number;
  timestamp: Date;
}

export interface TestResult {
  id: string;
  name: string;
  status: 'pass' | 'fail' | 'skip';
  duration: number;
  error?: string;
}

export interface ChangeRecord {
  id: string;
  action: 'created' | 'modified' | 'deleted';
  filePath: string;
  timestamp: Date;
  description?: string;
}

export interface Project {
  id: string;
  name: string;
  type: ProjectType;
  description: string;
  files: ProjectFile[];
  builds: BuildResult[];
  tests: TestResult[];
  changes: ChangeRecord[];
  logs: string[];
  createdAt: Date;
  updatedAt: Date;
  taskIds: string[];
}

interface ProjectContextType {
  projects: Project[];
  activeProjectId: string | null;
  activeProject: Project | null;
  createProject: (name: string, type: ProjectType, description: string) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  setActiveProject: (id: string | null) => void;
  addFile: (projectId: string, file: Omit<ProjectFile, 'id' | 'createdAt' | 'modifiedAt'>) => void;
  updateFile: (projectId: string, fileId: string, content: string) => void;
  deleteFile: (projectId: string, fileId: string) => void;
  addBuildResult: (projectId: string, result: Omit<BuildResult, 'id' | 'timestamp'>) => void;
  addTestResults: (projectId: string, results: Omit<TestResult, 'id'>[]) => void;
  addChange: (projectId: string, change: Omit<ChangeRecord, 'id' | 'timestamp'>) => void;
  addLog: (projectId: string, log: string) => void;
}

export const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  const activeProject = projects.find(p => p.id === activeProjectId) || null;

  const createProject = useCallback((
    name: string,
    type: ProjectType,
    description: string
  ): Project => {
    const project: Project = {
      id: `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      type,
      description,
      files: [],
      builds: [],
      tests: [],
      changes: [],
      logs: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      taskIds: [],
    };
    setProjects(prev => [project, ...prev]);
    setActiveProjectId(project.id);
    return project;
  }, []);

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    setProjects(prev =>
      prev.map(p => (p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p))
    );
  }, []);

  const deleteProject = useCallback((id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    setActiveProjectId(prev => (prev === id ? null : prev));
  }, []);

  const setActiveProject = useCallback((id: string | null) => {
    setActiveProjectId(id);
  }, []);

  const addFile = useCallback((
    projectId: string,
    file: Omit<ProjectFile, 'id' | 'createdAt' | 'modifiedAt'>
  ) => {
    const newFile: ProjectFile = {
      ...file,
      id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      modifiedAt: new Date(),
    };
    setProjects(prev =>
      prev.map(p =>
        p.id === projectId
          ? { ...p, files: [...p.files, newFile], updatedAt: new Date() }
          : p
      )
    );
  }, []);

  const updateFile = useCallback((projectId: string, fileId: string, content: string) => {
    setProjects(prev =>
      prev.map(p => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          files: p.files.map(f =>
            f.id === fileId
              ? { ...f, content, modifiedAt: new Date(), size: content.length }
              : f
          ),
          updatedAt: new Date(),
        };
      })
    );
  }, []);

  const deleteFile = useCallback((projectId: string, fileId: string) => {
    setProjects(prev =>
      prev.map(p =>
        p.id === projectId
          ? { ...p, files: p.files.filter(f => f.id !== fileId), updatedAt: new Date() }
          : p
      )
    );
  }, []);

  const addBuildResult = useCallback((
    projectId: string,
    result: Omit<BuildResult, 'id' | 'timestamp'>
  ) => {
    const buildResult: BuildResult = {
      ...result,
      id: `build_${Date.now()}`,
      timestamp: new Date(),
    };
    setProjects(prev =>
      prev.map(p =>
        p.id === projectId
          ? { ...p, builds: [buildResult, ...p.builds], updatedAt: new Date() }
          : p
      )
    );
  }, []);

  const addTestResults = useCallback((
    projectId: string,
    results: Omit<TestResult, 'id'>[]
  ) => {
    const testResults: TestResult[] = results.map(r => ({
      ...r,
      id: `test_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    }));
    setProjects(prev =>
      prev.map(p =>
        p.id === projectId
          ? { ...p, tests: [...testResults, ...p.tests], updatedAt: new Date() }
          : p
      )
    );
  }, []);

  const addChange = useCallback((
    projectId: string,
    change: Omit<ChangeRecord, 'id' | 'timestamp'>
  ) => {
    const record: ChangeRecord = {
      ...change,
      id: `change_${Date.now()}`,
      timestamp: new Date(),
    };
    setProjects(prev =>
      prev.map(p =>
        p.id === projectId
          ? { ...p, changes: [record, ...p.changes], updatedAt: new Date() }
          : p
      )
    );
  }, []);

  const addLog = useCallback((projectId: string, log: string) => {
    const entry = `[${new Date().toISOString()}] ${log}`;
    setProjects(prev =>
      prev.map(p =>
        p.id === projectId ? { ...p, logs: [...p.logs, entry] } : p
      )
    );
  }, []);

  return (
    <ProjectContext.Provider
      value={{
        projects,
        activeProjectId,
        activeProject,
        createProject,
        updateProject,
        deleteProject,
        setActiveProject,
        addFile,
        updateFile,
        deleteFile,
        addBuildResult,
        addTestResults,
        addChange,
        addLog,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}
