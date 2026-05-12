import { Button, Card, Empty, Space, Typography } from "antd";
import { useCallback, useMemo, useState } from "react";
import { Rnd } from "react-rnd";

import type { ManifestEntry, VariableConfig } from "../../../shared/types/visualization";
import VariablePanel from "../../../components/VariablePanel";

const DEFAULT_WINDOW_WIDTH = 520;
const DEFAULT_WINDOW_HEIGHT = 420;
const WINDOW_GAP = 16;
const WINDOW_COLUMNS = 2;

type WindowLayout = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const buildDefaultWindowLayout = (index: number): WindowLayout => ({
  x: (index % WINDOW_COLUMNS) * (DEFAULT_WINDOW_WIDTH + WINDOW_GAP),
  y: Math.floor(index / WINDOW_COLUMNS) * (DEFAULT_WINDOW_HEIGHT + WINDOW_GAP),
  width: DEFAULT_WINDOW_WIDTH,
  height: DEFAULT_WINDOW_HEIGHT,
});

type VisualCanvasProps = {
  manifest: ManifestEntry[];
  activeTimelineKey: string;
  variableConfigs: Record<string, VariableConfig>;
  onOpenConfig: (variable: string) => void;
  onRunVisualization: () => Promise<void>;
  canRun: boolean;
};

const { Text } = Typography;

const VisualCanvas = ({
  manifest,
  activeTimelineKey,
  variableConfigs,
  onOpenConfig,
  onRunVisualization,
  canRun,
}: VisualCanvasProps) => {
  const [windowLayouts, setWindowLayouts] = useState<Record<string, WindowLayout>>({});
  const manifestVariables = useMemo(() => manifest.map((entry) => entry.variable), [manifest]);

  const handleWindowLayoutChange = useCallback((variable: string, patch: Partial<WindowLayout>) => {
    setWindowLayouts((prev) => ({
      ...prev,
      [variable]: {
        ...(prev[variable] ?? buildDefaultWindowLayout(0)),
        ...patch,
      },
    }));
  }, []);

  const effectiveWindowLayouts = useMemo(() => Object.fromEntries(
    manifestVariables.map((variable, index) => [variable, windowLayouts[variable] ?? buildDefaultWindowLayout(index)]),
  ) as Record<string, WindowLayout>, [manifestVariables, windowLayouts]);

  const canvasHeight = useMemo(() => {
    const bottoms = manifestVariables.map((variable) => {
      const layout = effectiveWindowLayouts[variable];
      return layout.y + layout.height;
    });
    return Math.max(640, ...bottoms, 640) + WINDOW_GAP;
  }, [effectiveWindowLayouts, manifestVariables]);

  if (manifest.length === 0) {
    return (
      <Card className="surface-card surface-card-subtle visual-empty-card">
        <Empty
          description={(
            <Space orientation="vertical" size={10} style={{ width: "100%" }}>
              <Text strong>No visualization yet</Text>
              <Text type="secondary">1. Select variables to watch</Text>
              <Text type="secondary">2. Run the visualization</Text>
              <Text type="secondary">3. Step through the execution</Text>
              <Button type="primary" disabled={!canRun} onClick={() => void onRunVisualization()}>
                Run visualization
              </Button>
            </Space>
          )}
        />
      </Card>
    );
  }

  return (
    <div className="visual-canvas" style={{ height: canvasHeight }}>
      {manifest.map((entry, index) => {
        const layout = effectiveWindowLayouts[entry.variable] ?? buildDefaultWindowLayout(index);
        return (
          <Rnd
            key={entry.variable}
            bounds="parent"
            dragHandleClassName="variable-window-drag-handle"
            minWidth={360}
            minHeight={280}
            size={{ width: layout.width, height: layout.height }}
            position={{ x: layout.x, y: layout.y }}
            onDragStop={(_event, data) => handleWindowLayoutChange(entry.variable, { x: data.x, y: data.y })}
            onResizeStop={(_event, _direction, ref, _delta, position) => {
              handleWindowLayoutChange(entry.variable, {
                width: ref.offsetWidth,
                height: ref.offsetHeight,
                x: position.x,
                y: position.y,
              });
            }}
            className="visual-window-rnd"
          >
            <VariablePanel
              entry={entry}
              activeTimelineKey={activeTimelineKey}
              panelConfig={variableConfigs[entry.variable]}
              onOpenConfig={() => onOpenConfig(entry.variable)}
            />
          </Rnd>
        );
      })}
    </div>
  );
};

export default VisualCanvas;
