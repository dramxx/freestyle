import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useSessionStore } from "../stores/sessionStore";

export const useWebSocket = (sessionId: string) => {
  const socketRef = useRef<Socket | null>(null);
  const {
    updateFile,
    addFile,
    deleteFile,
    setActiveFile,
    addUser,
    removeUser,
    setConnectionStatus,
    session,
  } = useSessionStore();

  useEffect(() => {
    // Connect to WebSocket server
    socketRef.current = io("http://localhost:3002");

    const socket = socketRef.current;

    // Join session
    socket.emit("join-session", {
      sessionId,
      userName: "User " + Math.random().toString(36).substr(2, 9),
    });

    // Listen for session data
    socket.on("session-data", (sessionData) => {
      console.log("Received session data:", sessionData);
      // Update local session with server data if needed
    });

    // Listen for user joined
    socket.on("user-joined", (user) => {
      console.log("User joined:", user);
      addUser(user);
    });

    // Listen for user left
    socket.on("user-left", (user) => {
      console.log("User left:", user);
      removeUser(user.id);
    });

    // Listen for code changes from other users
    socket.on("code-change", (data) => {
      console.log("Received code change:", data);
      if (data.fileId && data.content !== undefined) {
        updateFile(data.fileId, data.content);
      }
    });

    // Listen for file operations
    socket.on("file-created", (file) => {
      console.log("File created by remote user:", file);
      // Check if file already exists, if so, just update content
      const existingFile = session.files.find((f) => f.id === file.id);
      if (existingFile) {
        updateFile(file.id, file.content);
      } else {
        addFile(file.name, file.content);
      }
    });

    socket.on("file-deleted", (fileId) => {
      console.log("File deleted by remote user:", fileId);
      deleteFile(fileId);
    });

    // Listen for initial file sync when joining session
    socket.on("file-sync", (files) => {
      console.log("Receiving file sync:", files);
      files.forEach((file: any) => {
        const existingFile = session.files.find((f) => f.id === file.id);
        if (existingFile) {
          updateFile(file.id, file.content);
        } else {
          addFile(file.name, file.content);
        }
      });
    });

    // Connection status
    socket.on("connect", () => {
      console.log("Connected to WebSocket server");
      setConnectionStatus(true);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from WebSocket server");
      setConnectionStatus(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [sessionId]);

  // Function to broadcast code changes
  const broadcastCodeChange = (fileId: string, content: string) => {
    if (socketRef.current) {
      socketRef.current.emit("code-change", {
        fileId,
        content,
        cursor: { fileId, position: 0 }, // TODO: Implement cursor tracking
      });
    }
  };

  // Function to broadcast file operations
  const broadcastFileCreated = (file: any) => {
    if (socketRef.current) {
      socketRef.current.emit("file-created", { file });
    }
  };

  const broadcastFileDeleted = (fileId: string) => {
    if (socketRef.current) {
      socketRef.current.emit("file-deleted", { fileId });
    }
  };

  return {
    broadcastCodeChange,
    broadcastFileCreated,
    broadcastFileDeleted,
  };
};
