export const buildTimelineKey = (step) =>
  step.timelineKey ?? `${step.meta?.execution_id ?? step.index ?? 0}:${step.meta?.order ?? 0}`;

export const buildTimelineFrames = (manifestEntries) => {
  const frames = new Map();
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
          stepId: step.stepId ?? step.step_id ?? timelineKey,
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
