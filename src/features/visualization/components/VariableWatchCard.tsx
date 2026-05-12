import { Button, Card, Input, Space, Tag, Typography } from "antd";
import type { KeyboardEvent } from "react";

import type { WatchState } from "../VisualizationWorkspaceContext";

const { Text } = Typography;

const handleKeyboardActivate = (event: KeyboardEvent, callback: () => void) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    callback();
  }
};

type VariableWatchCardProps = {
  watchState: WatchState;
};

const VariableWatchCard = ({ watchState }: VariableWatchCardProps) => (
  <Card
    className="surface-card surface-card-subtle variable-card-large"
    title="Watch variables"
  >
    {watchState.selectionLocked ? (
    <div className="variables-browser">
      <div className="variables-browser-list">
        <div className="variables-list-section">
          <Text strong>Watch list</Text>
          <div className="variable-chip-grid variable-chip-grid-large" style={{ marginTop: 8 }}>
            {watchState.watchVariables.map((variable) => (
              <Tag
                key={variable}
                className="clickable-tag watched-variable-tag"
                color={watchState.selectedVariable === variable ? "gold" : watchState.pendingWatchVariables.includes(variable) ? "orange" : "blue"}
                role="button"
                tabIndex={0}
                aria-label={`Select watched variable ${variable}`}
                aria-pressed={watchState.selectedVariable === variable}
                onClick={() => {
                  watchState.setSelectedVariable(variable);
                }}
                onKeyDown={(event) => handleKeyboardActivate(event, () => {
                  watchState.setSelectedVariable(variable);
                })}
              >
                {variable}
              </Tag>
            ))}
          </div>
        </div>

        <div className="variables-list-section">
          <Text strong>Detected variables</Text>
          <div className="variable-chip-grid variable-chip-grid-large" style={{ marginTop: 8 }}>
            {watchState.candidateVariables.map((variable) => (
              <Tag
                key={variable}
                color={watchState.watchVariables.includes(variable)
                  ? (watchState.pendingWatchVariables.includes(variable) ? "orange" : "blue")
                  : watchState.selectedVariable === variable ? "gold" : undefined}
                className="clickable-tag selectable-variable-tag"
                role="button"
                tabIndex={0}
                aria-label={`Select suggested variable ${variable}`}
                onClick={() => {
                  watchState.setSelectedVariable(variable);
                }}
                onKeyDown={(event) => handleKeyboardActivate(event, () => {
                  watchState.setSelectedVariable(variable);
                })}
              >
                {watchState.watchVariables.includes(variable) ? variable : `+ ${variable}`}
              </Tag>
            ))}
          </div>
        </div>
      </div>

      <div className="variables-browser-detail">
        <div className="variables-detail-section">
          <Text strong>Selected variable</Text>
          <div className="variables-selection-summary">
            {watchState.selectedVariable ? <Tag color="gold">{watchState.selectedVariable}</Tag> : <Text type="secondary">Select a variable from the list.</Text>}
          </div>
          <Text type="secondary">
            Status: {watchState.selectedVariable
              ? (watchState.watchVariables.includes(watchState.selectedVariable)
                ? (watchState.pendingWatchVariables.includes(watchState.selectedVariable) ? "Watched, needs config" : "Watched")
                : "Not watched")
              : "No variable selected"}
          </Text>
          <Space wrap style={{ marginTop: 14 }}>
            {!watchState.selectedVariable || !watchState.watchVariables.includes(watchState.selectedVariable) ? (
              <Button
                size="small"
                type="primary"
                disabled={!watchState.selectedVariable}
                onClick={() => {
                  if (!watchState.selectedVariable) {
                    return;
                  }
                  watchState.handleAddWatchVariable(watchState.selectedVariable);
                }}
              >
                Add to watch
              </Button>
            ) : (
              <Button
                size="small"
                type="primary"
                onClick={() => watchState.selectedVariable && watchState.handleOpenVariableConfig(watchState.selectedVariable)}
              >
                Configure
              </Button>
            )}
            <Button
              size="small"
              danger
              disabled={!watchState.selectedVariable || !watchState.watchVariables.includes(watchState.selectedVariable)}
              onClick={() => watchState.selectedVariable && watchState.removeWatchVariable(watchState.selectedVariable)}
            >
              Remove
            </Button>
          </Space>
        </div>

        <div className="variables-detail-section">
          <Text strong>Custom expression</Text>
          <Space orientation="vertical" size={8} style={{ width: "100%", marginTop: 8 }}>
            <Space.Compact style={{ width: "100%" }}>
              <Input
                value={watchState.watchDraft}
                placeholder={'data[0] or data["score"]'}
                onChange={(event) => watchState.setWatchDraft(event.target.value)}
                onPressEnter={watchState.handleSubmitWatchExpression}
              />
              <Button onClick={watchState.handleSubmitWatchExpression}>Add</Button>
            </Space.Compact>
            <Text type="secondary">Use this for expressions that are not simple identifiers, such as indexed values or dictionary lookups.</Text>
          </Space>
        </div>
      </div>
    </div>
    ) : (
      <div className="variables-hidden-state">
        <Text type="secondary">Variable picking is hidden while you edit code. Turn on code picking from the banner above when you want to add or configure watches.</Text>
      </div>
    )}
  </Card>
);

export default VariableWatchCard;
