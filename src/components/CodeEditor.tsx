import React, { useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { File } from "../types";
import { useSessionStore } from "../stores/sessionStore";

interface CodeEditorProps {
  file: File;
  height?: string;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  file,
  height = "400px",
}) => {
  const editorRef = useRef<any>(null);
  const updateFile = useSessionStore((state) => state.updateFile);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      updateFile(file.id, value);
    }
  };

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;

    // Configure editor settings
    editor.updateOptions({
      fontSize: 14,
      fontFamily: 'Monaco, Consolas, "Courier New", monospace',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      wordWrap: "on",
      lineNumbers: "on",
      renderWhitespace: "selection",
      automaticLayout: true,
    });

    // Set theme
    monaco.editor.setTheme("vs-dark");
  };

  return (
    <div className="editor-wrapper border border-gray-700 rounded-lg overflow-hidden">
      <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-300">{file.name}</span>
          <span className="language-badge">{file.language}</span>
        </div>
      </div>

      <div className="editor-content">
        <Editor
          height="100%"
          language={file.language}
          value={file.content}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          options={{
            selectOnLineNumbers: true,
            automaticLayout: true,
            scrollBeyondLastLine: false,
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: 'Monaco, Consolas, "Courier New", monospace',
            wordWrap: "on",
            lineNumbers: "on",
            renderWhitespace: "selection",
          }}
        />
      </div>
    </div>
  );
};
