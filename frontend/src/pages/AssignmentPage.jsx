import Editor from "@monaco-editor/react";

export default function AssignmentPage() {
  return (
    <div className="h-screen p-4">
      <Editor
        height="80vh"
        defaultLanguage="python"
        defaultValue="# Start coding..."
      />
    </div>
  );
}