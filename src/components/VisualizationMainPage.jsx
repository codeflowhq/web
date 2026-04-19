import Editor from "@monaco-editor/react";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  FolderOpenOutlined,
  LockOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  SaveOutlined,
  ShareAltOutlined,
  StepBackwardOutlined,
  StepForwardOutlined,
  UnlockOutlined,
} from "@ant-design/icons";
import { Button, Card, Empty, Input, Slider, Space, Tag, Tooltip, Typography } from "antd";
import { useMemo } from "react";

import VariablePanel from "./VariablePanel";

const { Paragraph, Text } = Typography;

const VisualizationMainPage = ({
  activeTimelineFrame,
  activeTimelineIndex,
  candidateVariables,
  editorOptions,
  handleAddWatchVariable,
  handleEditorMount,
  handleOpenVariableConfig,
  handleShare,
  handleSubmitWatchExpression,
  isPlaying,
  manifest,
  runVisualization,
  selectedVariable,
  selectionLocked,
  setActiveTimelineKey,
  setIsPlaying,
  setSaveModalOpen,
  setSelectedVariable,
  setSelectionLocked,
  setSourceCode,
  setTopMenuKey,
  watchDraft,
  setWatchDraft,
  watchVariables,
  setWatchVariables,
  sourceCode,
  status,
  stepTo,
  timelineFrames,
  variableConfigs,
}) => {
  const visualsPanel = useMemo(() => {
    if (manifest.length === 0) {
      return (
        <Card className="surface-card">
          <Empty description="No visuals yet" />
        </Card>
      );
    }
    return (
      <div className="visual-grid">
        {manifest.map((entry) => (
          <div key={entry.variable} className="visual-grid-item">
            <VariablePanel
              entry={entry}
              activeTimelineKey={activeTimelineFrame?.timelineKey ?? ""}
              panelConfig={variableConfigs[entry.variable]}
              onOpenConfig={() => handleOpenVariableConfig(entry.variable)}
            />
          </div>
        ))}
      </div>
    );
  }, [activeTimelineFrame?.timelineKey, handleOpenVariableConfig, manifest, variableConfigs]);

  return (
    <div className="viz-main-grid">
      <div className="viz-left-stack">
        <Card
          className="surface-card"
          title="Code"
          extra={<Tag color={status === "error" ? "error" : status === "ready" ? "success" : "processing"}>{status}</Tag>}
        >
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <Space wrap>
              <Button type="primary" onClick={runVisualization} loading={status === "loading"}>Run</Button>
              <Button icon={<FolderOpenOutlined />} onClick={() => setTopMenuKey("library")}>Library</Button>
              <Button icon={<SaveOutlined />} onClick={() => setSaveModalOpen(true)}>Save</Button>
              <Button icon={<ShareAltOutlined />} onClick={handleShare}>Share</Button>
            </Space>
            <Paragraph type="secondary" style={{ marginBottom: 0 }}>
              {selectionLocked
                ? "Selection is locked. Click identifiers in the editor to add them to watch."
                : "Editor is editable. Lock selection to enable click-to-watch."}
            </Paragraph>
            <div className="editor-shell">
              <Editor
                height="460px"
                defaultLanguage="python"
                theme="vs-dark"
                value={sourceCode}
                options={editorOptions}
                onChange={(value) => setSourceCode(value ?? "")}
                onMount={handleEditorMount}
              />
            </div>
          </Space>
        </Card>

        <Card
          className="surface-card variable-card-large"
          title="Variables"
          extra={
            <Button
              type={selectionLocked ? "primary" : "default"}
              icon={selectionLocked ? <UnlockOutlined /> : <LockOutlined />}
              onClick={() => setSelectionLocked((prev) => !prev)}
            >
              {selectionLocked ? "Unlock" : "Lock selection"}
            </Button>
          }
        >
          {selectionLocked ? (
            <div className="variables-two-column">
              <div className="variables-pane">
                <Text strong>Watched</Text>
                <Space wrap style={{ marginTop: 8, marginBottom: 12 }}>
                  <Text type="secondary">Selected:</Text>
                  {selectedVariable ? <Tag color="gold">{selectedVariable}</Tag> : <Text type="secondary">None</Text>}
                  <Button size="small" disabled={!selectedVariable} onClick={() => selectedVariable && handleOpenVariableConfig(selectedVariable)}>
                    Config
                  </Button>
                  <Button
                    size="small"
                    danger
                    disabled={!selectedVariable || !watchVariables.includes(selectedVariable)}
                    onClick={() => selectedVariable && setWatchVariables((prev) => prev.filter((item) => item !== selectedVariable))}
                  >
                    Delete
                  </Button>
                </Space>
                <div className="watch-chip-row">
                  {watchVariables.map((variable) => (
                    <Tag
                      key={variable}
                      className="clickable-tag watched-variable-tag"
                      color={selectedVariable === variable ? "gold" : "blue"}
                      closable
                      onClick={() => {
                        setSelectedVariable(variable);
                        handleOpenVariableConfig(variable);
                      }}
                      onClose={(event) => {
                        event.preventDefault();
                        setWatchVariables((prev) => prev.filter((item) => item !== variable));
                      }}
                    >
                      {variable}
                    </Tag>
                  ))}
                </div>
                <Space direction="vertical" size={8} style={{ width: "100%", marginTop: 16 }}>
                  <Text strong>Add expression</Text>
                  <Space.Compact style={{ width: "100%" }}>
                    <Input
                      value={watchDraft}
                      placeholder={'data[0] or data["score"]'}
                      onChange={(event) => setWatchDraft(event.target.value)}
                      onPressEnter={handleSubmitWatchExpression}
                    />
                    <Button onClick={handleSubmitWatchExpression}>Add</Button>
                  </Space.Compact>
                </Space>
              </div>

              <div className="variables-pane variables-pane-recommended">
                <Text strong>Recommended</Text>
                <div className="variable-chip-grid variable-chip-grid-large" style={{ marginTop: 8 }}>
                  {candidateVariables.map((variable) => (
                    <Tag
                      key={variable}
                      color={watchVariables.includes(variable) ? "blue" : selectedVariable === variable ? "gold" : undefined}
                      className="clickable-tag selectable-variable-tag"
                      onClick={() => {
                        setSelectedVariable(variable);
                        handleAddWatchVariable(variable, { openConfig: true });
                      }}
                    >
                      {variable}
                    </Tag>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <Text type="secondary">Lock selection to show variable picking and watch management.</Text>
          )}
        </Card>

      </div>

      <Card className="surface-card" title="Visuals" extra={<Text type="secondary">Resizable / arrangeable variable windows</Text>}>
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <div className="timeline-toolbar">
            <Space wrap>
              <Tooltip title="First step"><Button icon={<StepBackwardOutlined />} onClick={() => setActiveTimelineKey(timelineFrames[0]?.timelineKey ?? "")} /></Tooltip>
              <Tooltip title="Previous"><Button icon={<ArrowLeftOutlined />} onClick={() => stepTo(-1)} /></Tooltip>
              <Tooltip title={isPlaying ? "Pause" : "Play"}><Button type="primary" icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />} onClick={() => setIsPlaying((prev) => !prev)} /></Tooltip>
              <Tooltip title="Next"><Button icon={<ArrowRightOutlined />} onClick={() => stepTo(1)} /></Tooltip>
              <Tooltip title="Last step"><Button icon={<StepForwardOutlined />} onClick={() => setActiveTimelineKey(timelineFrames[timelineFrames.length - 1]?.timelineKey ?? "")} /></Tooltip>
            </Space>
          </div>

          <div className="timeline-slider-block">
            <Text type="secondary">{activeTimelineFrame ? activeTimelineFrame.stepId : "No steps"}</Text>
            <Slider
              min={0}
              max={Math.max(timelineFrames.length - 1, 0)}
              value={activeTimelineIndex}
              onChange={(value) => setActiveTimelineKey(timelineFrames[value]?.timelineKey ?? "")}
              tooltip={{ formatter: (value) => timelineFrames[value]?.stepId ?? "" }}
            />
          </div>

          <div className="visual-grid-shell">{visualsPanel}</div>
        </Space>
      </Card>
    </div>
  );
};

export default VisualizationMainPage;
