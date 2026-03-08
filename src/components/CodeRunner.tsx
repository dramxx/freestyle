import React, { useState } from "react";
import { executeCode } from "../utils/execution";
import { useSessionStore } from "../stores/sessionStore";
import { CodeExecutionResult } from "../types";

export const CodeRunner: React.FC = () => {
  const [result, setResult] = useState<CodeExecutionResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const currentFile = useSessionStore((state) => state.currentFile);

  const handleRun = async () => {
    if (!currentFile) return;

    setIsRunning(true);
    setResult(null);

    try {
      const executionResult = await executeCode(
        currentFile.content,
        currentFile.language as any,
      );
      setResult(executionResult);
    } catch (error) {
      setResult({
        output: "",
        error: error instanceof Error ? error.message : "Unknown error",
        executionTime: 0,
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleClear = () => {
    setResult(null);
  };

  if (!currentFile) {
    return (
      <div className="output-panel rounded-lg p-4">
        <p className="output-text text-sm">Select a file to run code</p>
      </div>
    );
  }

  const isExecutable =
    currentFile.language === "javascript" ||
    currentFile.language === "python" ||
    currentFile.language === "html";

  return (
    <div className="output-panel rounded-lg overflow-hidden">
      <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-300">Output</span>
          {result && (
            <span className="text-xs px-2 py-1 bg-green-600 text-white rounded">
              {result.executionTime.toFixed(2)}ms
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {result && (
            <button onClick={handleClear} className="btn-secondary">
              Clear
            </button>
          )}

          <button
            onClick={handleRun}
            disabled={!isExecutable || isRunning}
            className={`btn-success ${
              !isExecutable || isRunning ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isRunning ? "Running..." : "Run"}
          </button>
        </div>
      </div>

      <div className="p-4 min-h-[200px] max-h-[400px] overflow-y-auto custom-scrollbar">
        {isRunning && (
          <div className="flex items-center justify-center h-32">
            <div className="output-text">Running code...</div>
          </div>
        )}

        {!isRunning && !result && isExecutable && (
          <div className="output-text text-sm">
            Click "Run" to execute your {currentFile.language} code
          </div>
        )}

        {!isRunning && !result && !isExecutable && (
          <div className="output-text text-sm">
            Code execution is not supported for {currentFile.language} files
          </div>
        )}

        {result && (
          <div className="space-y-2">
            {result.error ? (
              <div className="output-error font-mono text-sm whitespace-pre-wrap">
                Error: {result.error}
              </div>
            ) : (
              <div className="output-success font-mono text-sm whitespace-pre-wrap">
                {result.output || "Code executed successfully (no output)"}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
