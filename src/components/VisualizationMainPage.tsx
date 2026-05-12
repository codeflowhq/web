import { Card, Space } from "antd";

import { useVisualizationWorkspace } from "../features/visualization/useVisualizationWorkspace";
import CodeEditorCard from "../features/visualization/components/CodeEditorCard";
import TimelineControls from "../features/visualization/components/TimelineControls";
import VariableWatchCard from "../features/visualization/components/VariableWatchCard";
import VisualCanvas from "../features/visualization/components/VisualCanvas";

const VisualizationMainPage = () => {
  const { editorState, pageActions, timelineState, variableConfigs, visualState, watchState } = useVisualizationWorkspace();
  const hasCode = editorState.sourceCode.trim().length > 0;

  return (
    <div className="viz-main-grid">
      <div className="viz-left-stack">
        <CodeEditorCard
          editorState={editorState}
          watchPickingEnabled={watchState.selectionLocked}
          onRunVisualization={pageActions.runVisualization}
          onTogglePicking={() => watchState.setSelectionLocked((prev) => !prev)}
        />
        <VariableWatchCard watchState={watchState} />
      </div>

      <Card className="surface-card surface-card-subtle" title="Visualization">
        <Space orientation="vertical" size={16} style={{ width: "100%" }}>
          <TimelineControls timelineState={timelineState} />
          <VisualCanvas
            manifest={visualState.manifest}
            activeTimelineKey={timelineState.activeTimelineFrame?.timelineKey ?? ""}
            variableConfigs={variableConfigs}
            onOpenConfig={watchState.handleOpenVariableConfig}
            onRunVisualization={pageActions.runVisualization}
            canRun={hasCode}
          />
        </Space>
      </Card>
    </div>
  );
};

export default VisualizationMainPage;
