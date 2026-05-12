import Editor from "@monaco-editor/react";
import { PlayCircleOutlined } from "@ant-design/icons";
import { Button, Card, Space, Tag, Typography } from "antd";

import type { EditorState } from "../VisualizationWorkspaceContext";

const { Text } = Typography;

type CodeEditorCardProps = {
  editorState: EditorState;
  watchPickingEnabled: boolean;
  onRunVisualization: () => Promise<void>;
  onTogglePicking: () => void;
};

const statusColor = (status: string) => {
  if (status === "error") {
    return "error";
  }
  if (status === "ready") {
    return "success";
  }
  return "processing";
};

const CodeEditorCard = ({
  editorState,
  watchPickingEnabled,
  onRunVisualization,
  onTogglePicking,
}: CodeEditorCardProps) => (
  <Card
    className="surface-card surface-card-subtle"
    title="Code"
    extra={(
      <Space size={8}>
        <Tag color={statusColor(editorState.status)}>{editorState.status}</Tag>
        <Button
          type="primary"
          icon={<PlayCircleOutlined />}
          loading={editorState.status === "loading"}
          disabled={!editorState.runtimeReady}
          onClick={() => void onRunVisualization()}
        >
          Run visualization
        </Button>
      </Space>
    )}
  >
    <Space orientation="vertical" size={16} style={{ width: "100%" }}>
      <div className={watchPickingEnabled ? "workspace-banner workspace-banner-active" : "workspace-banner"}>
        <div className="workspace-banner-copy">
          <Text strong>{watchPickingEnabled ? "Picking mode active" : "Editing mode active"}</Text>
          <Text type="secondary">
            {watchPickingEnabled
              ? "Picking mode active — click identifiers in the code to add them to Watch."
              : editorState.statusMessage}
          </Text>
        </div>
        <Button onClick={onTogglePicking}>
          {watchPickingEnabled ? "Back to editing" : "Pick watches from code"}
        </Button>
      </div>
      <div className="editor-shell">
        <Editor
          height="460px"
          defaultLanguage="python"
          theme="vs-dark"
          value={editorState.sourceCode}
          options={editorState.editorOptions}
          onChange={(value) => editorState.setSourceCode(value ?? "")}
          onMount={editorState.handleEditorMount}
        />
      </div>
    </Space>
  </Card>
);

export default CodeEditorCard;
