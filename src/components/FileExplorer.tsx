import React, { useState } from "react";
import { useSessionStore } from "../stores/sessionStore";
import { LANGUAGE_CONFIGS } from "../utils/languages";

export const FileExplorer: React.FC = () => {
  const { session, addFile, deleteFile, setActiveFile, currentFile } =
    useSessionStore();
  const [newFileName, setNewFileName] = useState("");
  const [showNewFileInput, setShowNewFileInput] = useState(false);
  const [error, setError] = useState<string>("");

  const handleCreateFile = () => {
    if (newFileName.trim()) {
      try {
        addFile(newFileName.trim());
        setNewFileName("");
        setShowNewFileInput(false);
        setError("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create file");
      }
    }
  };

  const handleDeleteFile = (fileId: string) => {
    deleteFile(fileId);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCreateFile();
    } else if (e.key === "Escape") {
      setNewFileName("");
      setShowNewFileInput(false);
      setError("");
    }
  };

  return (
    <div className="file-explorer w-64 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-sm font-semibold text-gray-300 mb-2">Files</h2>
        <button
          onClick={() => setShowNewFileInput(true)}
          className="btn-primary w-full"
        >
          + New File
        </button>

        {showNewFileInput && (
          <div className="mt-2">
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onKeyDown={handleKeyPress}
              onBlur={() => {
                setShowNewFileInput(false);
                setError("");
              }}
              placeholder="filename.js"
              className={`w-full px-2 py-1 text-sm bg-gray-800 border rounded text-white ${
                error ? "border-red-500" : "border-gray-600"
              }`}
              autoFocus
            />
            {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {session.files.map((file) => {
          const isActive = currentFile?.id === file.id;
          const config =
            LANGUAGE_CONFIGS[file.language as keyof typeof LANGUAGE_CONFIGS];

          return (
            <div
              key={file.id}
              className={`file-item flex items-center justify-between px-4 py-2 cursor-pointer group ${
                isActive ? "active" : ""
              }`}
              onClick={() => setActiveFile(file.id)}
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg">{config.icon}</span>
                <span
                  className={`text-sm ${isActive ? "text-white" : "text-gray-400"}`}
                >
                  {file.name}
                </span>
              </div>

              {session.files.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteFile(file.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity"
                >
                  ×
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t border-gray-700">
        <div className="text-xs text-gray-500">
          {session.files.length} file{session.files.length !== 1 ? "s" : ""}
        </div>
      </div>
    </div>
  );
};
