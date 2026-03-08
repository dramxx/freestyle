import React from "react";
import { useSessionStore } from "../stores/sessionStore";

export const Preview: React.FC = () => {
  const currentFile = useSessionStore((state) => state.currentFile);

  if (!currentFile) {
    return (
      <div className="preview-panel rounded-lg p-4">
        <p className="output-text text-sm">Select a file to preview</p>
      </div>
    );
  }

  if (currentFile.language === "html") {
    return (
      <div className="preview-panel rounded-lg overflow-hidden">
        <div className="bg-gray-800 px-4 py-2 border-b border-gray-700">
          <span className="text-sm font-medium text-gray-300">
            HTML Preview
          </span>
        </div>
        <div className="p-4">
          <iframe
            srcDoc={currentFile.content}
            className="preview-iframe w-full h-96 bg-white"
            title="HTML Preview"
            sandbox="allow-scripts"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="preview-panel rounded-lg p-4">
      <p className="output-text text-sm">
        Preview not available for {currentFile.language} files
      </p>
    </div>
  );
};
