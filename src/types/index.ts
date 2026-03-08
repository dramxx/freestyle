export interface File {
  id: string;
  name: string;
  content: string;
  language: string;
  path: string;
}

export interface Session {
  id: string;
  name: string;
  files: File[];
  activeFileId: string;
  users: User[];
  createdAt: Date;
}

export interface User {
  id: string;
  name: string;
  color: string;
  cursor?: {
    fileId: string;
    position: number;
  };
}

export interface CodeExecutionResult {
  output: string;
  error?: string;
  executionTime: number;
}

export type Language = 'javascript' | 'typescript' | 'python' | 'html' | 'css' | 'json';

export interface LanguageConfig {
  name: string;
  monaco: string;
  icon: string;
  executable: boolean;
}
