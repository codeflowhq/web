import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  StepBackwardOutlined,
  StepForwardOutlined,
} from "@ant-design/icons";
import { Button, Slider, Space, Tooltip, Typography } from "antd";

import type { TimelineState } from "../VisualizationWorkspaceContext";

const { Text } = Typography;

type TimelineControlsProps = {
  timelineState: TimelineState;
};

const TimelineControls = ({ timelineState }: TimelineControlsProps) => (
  <>
    <div className="timeline-toolbar">
      <div className="timeline-summary">
        <Text strong>
          {timelineState.timelineFrames.length
            ? `Step ${timelineState.activeTimelineIndex + 1} of ${timelineState.timelineFrames.length}`
            : "Execution timeline"}
        </Text>
        <Text type="secondary">
          {timelineState.activeTimelineFrame
            ? `Current operation: ${timelineState.activeTimelineFrame.stepId}`
            : "Run the visualization to generate execution steps."}
        </Text>
      </div>
      <Space wrap>
        <Tooltip title="First step"><Button aria-label="Jump to first timeline step" icon={<StepBackwardOutlined />} onClick={() => timelineState.setActiveTimelineKey(timelineState.timelineFrames[0]?.timelineKey ?? "")} /></Tooltip>
        <Tooltip title="Previous"><Button aria-label="Go to previous timeline step" icon={<ArrowLeftOutlined />} onClick={() => timelineState.stepTo(-1)} /></Tooltip>
        <Tooltip title={timelineState.isPlaying ? "Pause" : "Play"}><Button aria-label={timelineState.isPlaying ? "Pause timeline playback" : "Play timeline playback"} type="primary" icon={timelineState.isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />} onClick={() => timelineState.setIsPlaying((prev) => !prev)} /></Tooltip>
        <Tooltip title="Next"><Button aria-label="Go to next timeline step" icon={<ArrowRightOutlined />} onClick={() => timelineState.stepTo(1)} /></Tooltip>
        <Tooltip title="Last step"><Button aria-label="Jump to last timeline step" icon={<StepForwardOutlined />} onClick={() => timelineState.setActiveTimelineKey(timelineState.timelineFrames[timelineState.timelineFrames.length - 1]?.timelineKey ?? "")} /></Tooltip>
      </Space>
    </div>

    <div className="timeline-slider-block">
      <Text type="secondary">{timelineState.activeTimelineFrame ? timelineState.activeTimelineFrame.stepId : "No steps"}</Text>
      <Slider
        min={0}
        max={Math.max(timelineState.timelineFrames.length - 1, 0)}
        value={timelineState.activeTimelineIndex}
        onChange={(value) => {
          const nextFrame = timelineState.timelineFrames[value as number];
          if (nextFrame) {
            timelineState.setActiveTimelineKey(nextFrame.timelineKey);
          }
        }}
      />
    </div>
  </>
);

export default TimelineControls;
