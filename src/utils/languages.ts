import { Language, LanguageConfig } from '../types';

export const LANGUAGE_CONFIGS: Record<Language, LanguageConfig> = {
  javascript: {
    name: 'JavaScript',
    monaco: 'javascript',
    icon: '🟨',
    executable: true,
  },
  typescript: {
    name: 'TypeScript',
    monaco: 'typescript',
    icon: '🔷',
    executable: false,
  },
  python: {
    name: 'Python',
    monaco: 'python',
    icon: '🐍',
    executable: true,
  },
  html: {
    name: 'HTML',
    monaco: 'html',
    icon: '🌐',
    executable: true,
  },
  css: {
    name: 'CSS',
    monaco: 'css',
    icon: '🎨',
    executable: false,
  },
  json: {
    name: 'JSON',
    monaco: 'json',
    icon: '📄',
    executable: false,
  },
};

export function detectLanguage(filename: string): Language {
  const ext = filename.split('.').pop()?.toLowerCase();
  
  switch (ext) {
    case 'js':
    case 'jsx':
      return 'javascript';
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'py':
      return 'python';
    case 'html':
    case 'htm':
      return 'html';
    case 'css':
      return 'css';
    case 'json':
      return 'json';
    default:
      return 'javascript';
  }
}

export function getFileExtension(language: Language): string {
  switch (language) {
    case 'javascript':
      return '.js';
    case 'typescript':
      return '.ts';
    case 'python':
      return '.py';
    case 'html':
      return '.html';
    case 'css':
      return '.css';
    case 'json':
      return '.json';
    default:
      return '.txt';
  }
}
