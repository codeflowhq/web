import type { ManifestEntry } from "../shared/types/visualization";

import { buildTimelineKey } from "./timelineKeys";

export type TimelineFrame = {
  timelineKey: string;
  index: number;
  executionOrder: number;
  order: number;
  stepId: string;
};

export const buildTimelineFrames = (manifestEntries: ManifestEntry[]): TimelineFrame[] => {
  const frames = new Map<string, TimelineFrame>();
  manifestEntries.forEach((entry) => {
    entry.steps.forEach((step) => {
      const executionOrder = Number(step.executionId ?? step.meta?.execution_id ?? step.index ?? 0);
      const order = Number(step.order ?? step.meta?.order ?? 0);
      const timelineKey = buildTimelineKey(step);
      if (!frames.has(timelineKey)) {
        frames.set(timelineKey, {
          timelineKey,
          index: step.index ?? 0,
          executionOrder,
          order,
          stepId: step.stepId ?? timelineKey,
        });
      }
    });
  });
  return [...frames.values()].sort(
    (left, right) =>
      left.executionOrder - right.executionOrder ||
      left.order - right.order ||
      left.index - right.index ||
      left.timelineKey.localeCompare(right.timelineKey),
  );
};
