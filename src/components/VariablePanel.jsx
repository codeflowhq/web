import { SettingOutlined } from "@ant-design/icons";
import { Button, Card, Empty, Space, Tag, Typography } from "antd";
import { Suspense, lazy, useMemo } from "react";

const GraphvizPanel = lazy(() => import("./GraphvizPanel"));
const SvgPanel = lazy(() => import("./SvgPanel"));

const { Text } = Typography;

const buildTimelineKey = (step) => step.timelineKey ?? `${step.meta?.execution_id ?? step.index}:${step.meta?.order ?? 0}`;

const parseTimelineKey = (timelineKey) => {
  const [execution = "0", order = "0"] = String(timelineKey ?? "0:0").split(":");
  return { execution: Number(execution) || 0, order: Number(order) || 0 };
};

const isAtOrBefore = (step, target) => {
  const stepKey = parseTimelineKey(buildTimelineKey(step));
  return stepKey.execution < target.execution || (stepKey.execution === target.execution && stepKey.order <= target.order);
};

const VariablePanel = ({ entry, panelConfig, activeTimelineKey, onOpenConfig }) => {
  const currentStep = useMemo(() => {
    if (!entry.steps.length) {
      return undefined;
    }
    const exact = entry.steps.find((step) => buildTimelineKey(step) === activeTimelineKey);
    if (exact) {
      return exact;
    }
    const target = parseTimelineKey(activeTimelineKey);
    return [...entry.steps].reverse().find((step) => isAtOrBefore(step, target)) ?? entry.steps[0];
  }, [activeTimelineKey, entry.steps]);

  const meta = currentStep?.meta ?? {};
  const configSummary = useMemo(() => {
    const parts = [];
    if (panelConfig?.viewKind && panelConfig.viewKind !== "auto") {
      parts.push(`view=${panelConfig.viewKind}`);
    }
    if (panelConfig?.depth != null) {
      parts.push(`depth=${panelConfig.depth}`);
    }
    if (panelConfig?.maxSteps != null) {
      parts.push(`steps=${panelConfig.maxSteps}`);
    }
    return parts;
  }, [panelConfig]);

  return (
    <Card
      size="small"
      title={
        <Button type="link" className="variable-card-title-button" onClick={onOpenConfig}>
          <Space size={8}>
            <Text strong>{entry.variable}</Text>
            <Tag>{`${currentStep?.stepId ?? 0}`}</Tag>
          </Space>
        </Button>
      }
      extra={<Button type="text" icon={<SettingOutlined />} onClick={onOpenConfig} aria-label={`Configure ${entry.variable}`} />}
      styles={{ body: { minHeight: 220 } }}
      style={{ height: "100%" }}
    >
      <div>
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <Space wrap>
            {entry.kind ? <Tag color="blue">{entry.kind}</Tag> : null}
            {meta.access_path ? <Tag>{meta.access_path}</Tag> : null}
            {meta.line_number ? <Tag color="purple">line {meta.line_number}</Tag> : null}
            {configSummary.map((item) => (
              <Tag key={item}>{item}</Tag>
            ))}
          </Space>

          <div className="visual-window-body">
            {entry.kind === "dot" && currentStep?.dot ? (
              <Suspense fallback={<div className="panel-loading">Loading graph…</div>}>
                <GraphvizPanel dot={currentStep.dot} debugName={entry.variable} />
              </Suspense>
            ) : null}
            {entry.kind === "svg" && currentStep?.svg ? (
              <Suspense fallback={<div className="panel-loading">Loading svg…</div>}>
                <SvgPanel svg={currentStep.svg} />
              </Suspense>
            ) : null}
            {!currentStep ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No frame" /> : null}
          </div>
        </Space>
      </div>
    </Card>
  );
};

export default VariablePanel;
