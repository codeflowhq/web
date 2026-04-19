import { Alert, Button, Drawer, Form, Input, InputNumber, Modal, Select, Space } from "antd";
import { useEffect, useState } from "react";

const VariableConfigDrawer = ({
  open,
  variableName,
  variableConfig,
  defaultVariableConfig,
  viewKindOptions,
  onClose,
  onChange,
  messageApi,
  setVariableConfigs,
  setWatchVariables,
  pendingWatchVariable,
  setPendingWatchVariable,
}) => {
  const [draft, setDraft] = useState(variableConfig);

  useEffect(() => {
    setDraft(variableConfig);
  }, [variableConfig]);

  const applyChanges = () => {
    onChange("viewKind", draft.viewKind);
    onChange("depth", draft.depth);
    onChange("maxSteps", draft.maxSteps);
    setVariableConfigs((prev) => ({
      ...prev,
      [variableName]: {
        ...defaultVariableConfig,
        ...(prev[variableName] ?? {}),
        ...draft,
        viewOptions: {
          ...(prev[variableName]?.viewOptions ?? defaultVariableConfig.viewOptions),
          ...(draft.viewOptions ?? {}),
        },
      },
    }));
    const wasPending = pendingWatchVariable === variableName;
    if (wasPending) {
      setWatchVariables((prev) => (prev.includes(variableName) ? prev : [...prev, variableName]));
      setPendingWatchVariable(null);
    }
    messageApi?.success(wasPending ? `Added ${variableName} to watch list.` : `Applied config for ${variableName}.`);
    onClose();
  };

  const confirmApply = () => {
    Modal.confirm({
      title: pendingWatchVariable === variableName ? "Add variable to watch?" : "Apply variable config?",
      content: pendingWatchVariable === variableName
        ? `Apply this configuration and add ${variableName} to the watch list.`
        : `Apply configuration changes for ${variableName}.`,
      okText: "Apply",
      cancelText: "Cancel",
      centered: true,
      onOk: applyChanges,
    });
  };

  return (
    <Drawer
      open={open}
      size="large"
      title={variableName ? `Variable config · ${variableName}` : "Variable config"}
      onClose={onClose}
      footer={
        <div className="drawer-action-footer">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" onClick={confirmApply}>Apply changes</Button>
        </div>
      }
    >
      {variableName ? (
        <Form layout="vertical">
          {pendingWatchVariable === variableName ? (
            <Alert
              type="info"
              showIcon
              message="Confirm watch variable"
              description="This variable will be added to the watch list only after you apply the configuration."
              style={{ marginBottom: 16 }}
            />
          ) : null}
          <Form.Item label="View kind">
            <Select
              value={draft.viewKind}
              options={viewKindOptions.map((value) => ({ label: value, value }))}
              onChange={(value) => setDraft((prev) => ({ ...prev, viewKind: value }))}
            />
          </Form.Item>
          <Form.Item label="Depth">
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
          </Form.Item>
          <Form.Item label="Max steps">
            <InputNumber
              min={1}
              max={500}
              placeholder="inherit"
              value={draft.maxSteps}
              onChange={(value) => setDraft((prev) => ({ ...prev, maxSteps: value ?? null }))}
            />
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
          </Form.Item>
        </Form>
      ) : null}
    </Drawer>
  );
};

export default VariableConfigDrawer;
