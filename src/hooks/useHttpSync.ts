import { useEffect, useState } from "react";
import { useSessionStore } from "../stores/sessionStore";

// HTTP-based session synchronization that works across browsers
export const useHttpSync = () => {
  const { session, updateFile, addFile } = useSessionStore();
  const [lastSync, setLastSync] = useState<string>("");

  // Simple HTTP endpoint for session storage (using JSONPlaceholder as demo)
  const SESSION_API = "http://localhost:3002/api/sessions";

  const saveSession = async () => {
    try {
      const sessionData = {
        id: session.id,
        name: session.name,
        files: session.files,
        activeFileId: session.activeFileId,
        lastUpdated: new Date().toISOString(),
      };

      console.log("Saving session via HTTP:", sessionData);

      // Save to our server
      const response = await fetch(`${SESSION_API}/${session.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sessionData),
      });

      if (!response.ok) {
        throw new Error("Failed to save session");
      }

      setLastSync(sessionData.lastUpdated);
    } catch (error) {
      console.error("Save session error:", error);
    }
  };

  const loadSession = async (sessionId: string) => {
    try {
      console.log("Loading session via HTTP:", sessionId);

      const response = await fetch(`${SESSION_API}/${sessionId}`);
      if (!response.ok) {
        console.log("Session not found, creating new one");
        return null;
      }

      const sessionData = await response.json();
      console.log("Loaded session data:", sessionData);
      return sessionData;
    } catch (error) {
      console.error("Load session error:", error);
      return null;
    }
  };

  // Load session on mount if session ID in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get("session");

    if (sessionId) {
      loadSession(sessionId).then((sessionData) => {
        if (sessionData) {
          // Sync files from server
          sessionData.files?.forEach((file: any) => {
            const existingFile = session.files.find((f) => f.id === file.id);
            if (existingFile) {
              if (existingFile.content !== file.content) {
                updateFile(file.id, file.content);
              }
            } else {
              addFile(file.name, file.content);
            }
          });
        }
      });
    }
  }, [session.id, updateFile, addFile]);

  // Auto-save session when files change
  useEffect(() => {
    if (session.files.length > 0) {
      const timeoutId = setTimeout(() => {
        saveSession();
      }, 1000); // Save after 1 second of inactivity

      return () => clearTimeout(timeoutId);
    }
  }, [session.files, session.activeFileId]);

  // Poll for changes from other users
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get("session") || session.id;

    const pollInterval = setInterval(async () => {
      const sessionData = await loadSession(sessionId);
      if (sessionData && sessionData.lastUpdated !== lastSync) {
        console.log("Detected remote changes, updating...");

        // Update files with remote changes
        sessionData.files?.forEach((file: any) => {
          const existingFile = session.files.find((f) => f.id === file.id);
          if (existingFile && existingFile.content !== file.content) {
            console.log("Updating file from remote:", file.name);
            updateFile(file.id, file.content);
          }
        });

        setLastSync(sessionData.lastUpdated);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(pollInterval);
  }, [session.id, lastSync, updateFile]);

  return { saveSession, loadSession };
};
