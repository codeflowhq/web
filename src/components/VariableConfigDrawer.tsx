import { useEffect, useState } from "react";
import { Alert, Button, Form, Input, InputNumber, Menu, Modal, Select, Space, Tag, Typography } from "antd";

import type { VariableConfig, ViewKind } from "../shared/types/visualization";

const { Paragraph, Text } = Typography;

type VariableConfigDrawerProps = {
  open: boolean;
  variableName: string | null;
  availableVariables: string[];
  variableConfig: VariableConfig;
  defaultVariableConfig: VariableConfig;
  viewKindOptions: ViewKind[];
  onClose: () => void;
  onApply: (variableName: string, draft: VariableConfig) => void;
  pendingWatchVariables: string[];
  onSelectVariable: (variableName: string) => void;
};

const VariableConfigDrawer = ({
  open,
  variableName,
  availableVariables,
  variableConfig,
  defaultVariableConfig,
  viewKindOptions,
  onClose,
  onApply,
  pendingWatchVariables,
  onSelectVariable,
}: VariableConfigDrawerProps) => {
  const [draft, setDraft] = useState<VariableConfig>(variableConfig);

  useEffect(() => {
    setDraft(variableConfig);
  }, [variableConfig]);

  const isPending = variableName ? pendingWatchVariables.includes(variableName) : false;

  const confirmApply = () => {
    if (!variableName) {
      return;
    }
    Modal.confirm({
      title: isPending ? "Apply watch settings?" : "Apply variable config?",
      content: isPending
        ? `Apply this configuration and add ${variableName} to the watch list.`
        : `Apply configuration changes for ${variableName}.`,
      okText: "Apply",
      cancelText: "Cancel",
      centered: true,
      onOk: () => onApply(variableName, draft),
    });
  };

  return (
    <Modal
      open={open}
      width={720}
      title={variableName ? `Watch settings · ${variableName}` : "Watch settings"}
      onCancel={onClose}
      destroyOnClose={false}
      footer={
        <div className="drawer-action-footer">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" onClick={confirmApply}>Apply changes</Button>
        </div>
      }
    >
      {variableName ? (
        <Form layout="vertical">
          <Paragraph type="secondary">
            Configure how this watched variable is rendered. Use the variable list on the left to jump between watched variables without leaving this dialog.
          </Paragraph>
          <div className="watch-settings-layout">
            <div className="watch-settings-sidebar">
              <Text strong>Watched variables</Text>
              <Menu
                mode="inline"
                selectedKeys={variableName ? [variableName] : []}
                items={availableVariables.map((value) => ({
                  key: value,
                  label: (
                    <Space size={8}>
                      <span>{value}</span>
                      {pendingWatchVariables.includes(value) ? <Tag color="gold">needs config</Tag> : null}
                    </Space>
                  ),
                }))}
                onClick={({ key }) => onSelectVariable(String(key))}
                style={{ marginTop: 12 }}
              />
            </div>
            <div className="watch-settings-content">
              {isPending ? (
                <Alert
                  type="info"
                  showIcon
                  message="Watch needs configuration"
                  description="This variable is already in the watch list. Apply settings when you are ready."
                  style={{ marginBottom: 16 }}
                />
              ) : null}
              <Space wrap style={{ marginBottom: 16 }}>
                <Tag color={isPending ? "gold" : "blue"}>
                  {isPending ? "Needs config" : "Configured watch"}
                </Tag>
                <Tag>{variableConfig.depth == null ? "Depth: inherit global" : `Depth: ${variableConfig.depth}`}</Tag>
              </Space>
              <Form.Item label="View kind">
                <Select
                  value={draft.viewKind}
                  options={viewKindOptions.map((value) => ({ label: value, value }))}
                  onChange={(value: ViewKind) => setDraft((prev) => ({ ...prev, viewKind: value }))}
                />
              </Form.Item>
              <Form.Item label="Depth override">
                <Space.Compact style={{ width: "100%" }}>
                  <InputNumber
                    min={0}
                    max={20}
                    value={draft.depth}
                    onChange={(value) => setDraft((prev) => ({ ...prev, depth: value ?? null }))}
                    placeholder="inherit"
                    style={{ width: "100%" }}
                  />
                  <Button onClick={() => setDraft((prev) => ({ ...prev, depth: null }))}>Inherit</Button>
                </Space.Compact>
                <Text type="secondary">Leave this empty to use the global recursion depth for this variable.</Text>
              </Form.Item>
              <Form.Item label="Bar color">
                <Input
                  value={draft.viewOptions?.barColor ?? "#2563eb"}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      viewOptions: {
                        ...(prev.viewOptions ?? defaultVariableConfig.viewOptions),
                        barColor: event.target.value,
                      },
                    }))
                  }
                />
                <Text type="secondary">Used by numeric bar-style views. Safe to ignore for non-bar views.</Text>
              </Form.Item>
            </div>
          </div>
        </Form>
      ) : null}
    </Modal>
  );
};

export default VariableConfigDrawer;
