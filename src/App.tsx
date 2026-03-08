import { useEffect } from "react";
import { Header } from "./components/Header";
import { FileExplorer } from "./components/FileExplorer";
import { CodeEditor } from "./components/CodeEditor";
import { CodeRunner as CodeRunnerComponent } from "./components/CodeRunner";
import { Preview } from "./components/Preview";
import { useSessionStore } from "./stores/sessionStore";
import { useSimpleShare } from "./hooks/useSimpleShare";

function App() {
  const { currentFile, createSession, addUser, setConnectionStatus } =
    useSessionStore();

  // Use simple sharing
  useSimpleShare();

  // Check for session ID in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get("session");

    if (sessionId) {
      // Join existing session with specific ID
      createSession("Shared Session", sessionId);
    } else {
      // Create new session
      createSession("My Code Session");
    }

    // Simulate connection and add current user
    setTimeout(() => {
      setConnectionStatus(true);
      addUser({
        id: "current-user",
        name: "You",
        color: "#3B82F6",
      });
    }, 100);
  }, [createSession, addUser, setConnectionStatus]);

  return (
    <div className="h-screen flex flex-col bg-black">
      <Header />

      <div className="flex-1 flex overflow-hidden">
        <FileExplorer />

        <div className="flex-1 flex flex-col p-4 space-y-4">
          {currentFile ? (
            <>
              <div className="flex-1 min-h-0">
                <CodeEditor file={currentFile} height="100%" />
              </div>

              <div className="grid grid-cols-2 gap-4 h-96">
                <CodeRunnerComponent />
                <Preview />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-xl font-medium text-gray-400 mb-2">
                  No file selected
                </h2>
                <p className="text-gray-500">
                  Create a new file or select an existing one to start coding
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
