import { create } from "zustand";
import { File, Session, User } from "../types";
import { detectLanguage } from "../utils/languages";
import {
  validateFileName,
  validateUserName,
  VALIDATION_ERRORS,
} from "../utils/validation";

interface SessionState {
  session: Session;
  currentFile: File | null;
  isConnected: boolean;

  // Actions
  createSession: (name: string, sessionId?: string) => void;
  addFile: (name: string, content?: string) => void;
  updateFile: (fileId: string, content: string) => void;
  deleteFile: (fileId: string) => void;
  setActiveFile: (fileId: string) => void;
  addUser: (user: User) => void;
  removeUser: (userId: string) => void;
  setConnectionStatus: (connected: boolean) => void;
  // Computed values
  users: User[];
}

export const useSessionStore = create<SessionState>((set, get) => ({
  session: {
    id: crypto.randomUUID(),
    name: "New Session",
    files: [],
    activeFileId: "",
    users: [],
    createdAt: new Date(),
  },
  currentFile: null,
  isConnected: false,

  // Computed getter - use in components
  get users() {
    return this.session.users;
  },

  createSession: (name: string, sessionId?: string) => {
    const session: Session = {
      id: sessionId || crypto.randomUUID(),
      name,
      files: [
        {
          id: crypto.randomUUID(),
          name: "index.js",
          content: '// Welcome to CodeCollab!\nconsole.log("Hello, World!");',
          language: "javascript",
          path: "/index.js",
        },
      ],
      activeFileId: "",
      users: [],
      createdAt: new Date(),
    };

    set({
      session,
      currentFile: session.files[0],
      users: [],
    });
  },

  addFile: (name: string, content = "") => {
    // Validate file name
    if (!validateFileName(name)) {
      throw new Error(VALIDATION_ERRORS.INVALID_FILENAME);
    }

    const { session } = get();

    // Check for duplicate file names
    if (session.files.some((file) => file.name === name)) {
      throw new Error("File with this name already exists");
    }

    const newFile: File = {
      id: crypto.randomUUID(),
      name,
      content,
      language: detectLanguage(name),
      path: `/${name}`,
    };

    const updatedSession = {
      ...session,
      files: [...session.files, newFile],
    };

    set({ session: updatedSession });

    // If this is the first file, make it active
    if (session.files.length === 1) {
      const updatedSessionWithActive = {
        ...updatedSession,
        activeFileId: newFile.id,
      };
      set({ session: updatedSessionWithActive, currentFile: newFile });
    } else {
      set({ session: updatedSession });
    }
  },

  updateFile: (fileId: string, content: string) => {
    const { session } = get();
    const updatedFiles = session.files.map((file) =>
      file.id === fileId ? { ...file, content } : file,
    );

    const updatedSession = {
      ...session,
      files: updatedFiles,
    };

    set({ session: updatedSession });

    // Update currentFile if it's the one being edited
    if (get().currentFile?.id === fileId) {
      set({ currentFile: { ...get().currentFile!, content } });
    }
  },

  deleteFile: (fileId: string) => {
    const { session } = get();
    const updatedFiles = session.files.filter((file) => file.id !== fileId);

    // Don't allow deleting the last file
    if (updatedFiles.length === 0) return;

    const updatedSession = {
      ...session,
      files: updatedFiles,
      activeFileId:
        session.activeFileId === fileId
          ? updatedFiles[0].id
          : session.activeFileId,
    };

    set({ session: updatedSession });

    // Update currentFile if needed
    if (get().currentFile?.id === fileId) {
      set({ currentFile: updatedFiles[0] });
    }
  },

  setActiveFile: (fileId: string) => {
    const { session } = get();
    const file = session.files.find((f) => f.id === fileId);

    if (file) {
      set({
        currentFile: file,
        session: { ...session, activeFileId: fileId },
      });
    }
  },

  addUser: (user: User) => {
    // Validate user name
    if (!validateUserName(user.name)) {
      throw new Error(VALIDATION_ERRORS.INVALID_USERNAME);
    }

    const { session } = get();
    if (!session.users.find((u) => u.id === user.id)) {
      const updatedSession = {
        ...session,
        users: [...session.users, user],
      };
      set({ session: updatedSession });
    }
  },

  removeUser: (userId: string) => {
    const { session } = get();
    const updatedSession = {
      ...session,
      users: session.users.filter((u) => u.id !== userId),
    };
    set({ session: updatedSession });
  },

  setConnectionStatus: (connected: boolean) => {
    set({ isConnected: connected });
  },
}));
