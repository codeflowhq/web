export const normalizeManifest = (payload) => ({
  manifest: (payload.manifest ?? []).map((entry) => ({
    ...entry,
    steps: (entry.steps ?? []).map((step, index) => ({
      ...step,
      index: step.index ?? index + 1,
      stepId: step.step_id ?? step.stepId ?? String(step.order ?? step.meta?.order ?? step.index ?? index),
      timelineKey: step.timeline_key ?? step.timelineKey ?? `${step.meta?.execution_id ?? step.index}:${step.meta?.order ?? 0}`,
      executionId: step.execution_id ?? step.executionId ?? step.meta?.execution_id ?? null,
      order: step.order ?? step.meta?.order ?? null,
    })),
  })),
});
