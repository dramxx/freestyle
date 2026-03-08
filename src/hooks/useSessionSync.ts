import { useEffect } from "react";
import { useSessionStore } from "../stores/sessionStore";

// Simple session synchronization using localStorage for demo
export const useSessionSync = () => {
  const { session, updateFile, addFile } = useSessionStore();

  useEffect(() => {
    // Check for session ID in URL
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get("session");

    if (sessionId) {
      // Load session data from localStorage
      const storedSession = localStorage.getItem(`session-${sessionId}`);
      if (storedSession) {
        try {
          const sessionData = JSON.parse(storedSession);
          console.log("Loading session from storage:", sessionData);

          // Sync files from storage
          sessionData.files?.forEach((file: any) => {
            const existingFile = session.files.find((f) => f.id === file.id);
            if (existingFile) {
              updateFile(file.id, file.content);
            } else {
              addFile(file.name, file.content);
            }
          });
        } catch (error) {
          console.error("Failed to load session:", error);
        }
      }
    }
  }, [session.id, updateFile, addFile]);

  useEffect(() => {
    // Save session changes to localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get("session") || session.id;

    // Debounce save to avoid excessive writes
    const timeoutId = setTimeout(() => {
      const sessionData = {
        id: session.id,
        name: session.name,
        files: session.files,
        activeFileId: session.activeFileId,
        lastUpdated: new Date().toISOString(),
      };

      localStorage.setItem(`session-${sessionId}`, JSON.stringify(sessionData));
      console.log("Saved session to storage:", sessionData);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [session.files, session.activeFileId, session.id, session.name]);

  // Function to simulate real-time updates (polling localStorage)
  const startPolling = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get("session") || session.id;

    const pollInterval = setInterval(() => {
      const storedSession = localStorage.getItem(`session-${sessionId}`);
      if (storedSession) {
        try {
          const sessionData = JSON.parse(storedSession);

          // Check if files have been updated by another tab
          sessionData.files?.forEach((file: any) => {
            const existingFile = session.files.find((f) => f.id === file.id);
            if (existingFile && existingFile.content !== file.content) {
              console.log(
                "Detected external change, updating file:",
                file.name,
              );
              updateFile(file.id, file.content);
            }
          });
        } catch (error) {
          console.error("Polling error:", error);
        }
      }
    }, 1000); // Poll every second

    return () => clearInterval(pollInterval);
  };

  return { startPolling };
};
