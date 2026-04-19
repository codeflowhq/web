import { useCallback, useEffect, useMemo, useState } from "react";

import { buildTimelineFrames } from "../lib/timeline";

export const useTimelinePlayback = (manifest) => {
  const [activeTimelineKey, setActiveTimelineKey] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);

  const timelineFrames = useMemo(() => buildTimelineFrames(manifest), [manifest]);
  const activeTimelineIndex = useMemo(() => {
    const index = timelineFrames.findIndex((frame) => frame.timelineKey === activeTimelineKey);
    return index >= 0 ? index : 0;
  }, [activeTimelineKey, timelineFrames]);
  const activeTimelineFrame = timelineFrames[activeTimelineIndex];

  useEffect(() => {
    if (timelineFrames.length === 0) {
      setActiveTimelineKey("");
      setIsPlaying(false);
      return;
    }
    setActiveTimelineKey((prev) => (
      timelineFrames.some((frame) => frame.timelineKey === prev) ? prev : timelineFrames[0].timelineKey
    ));
  }, [timelineFrames]);

  useEffect(() => {
    if (!isPlaying || timelineFrames.length === 0) {
      return undefined;
    }
    const timer = window.setInterval(() => {
      setActiveTimelineKey((prev) => {
        const currentIndex = timelineFrames.findIndex((frame) => frame.timelineKey === prev);
        if (currentIndex < 0 || currentIndex >= timelineFrames.length - 1) {
          setIsPlaying(false);
          return timelineFrames[timelineFrames.length - 1]?.timelineKey ?? "";
        }
        return timelineFrames[currentIndex + 1].timelineKey;
      });
    }, 800);
    return () => window.clearInterval(timer);
  }, [isPlaying, timelineFrames]);

  const stepTo = useCallback(
    (offset) => {
      if (timelineFrames.length === 0) {
        return;
      }
      const nextIndex = Math.max(0, Math.min(timelineFrames.length - 1, activeTimelineIndex + offset));
      setActiveTimelineKey(timelineFrames[nextIndex]?.timelineKey ?? "");
    },
    [activeTimelineIndex, timelineFrames],
  );

  return {
    activeTimelineFrame,
    activeTimelineIndex,
    activeTimelineKey,
    isPlaying,
    setActiveTimelineKey,
    setIsPlaying,
    stepTo,
    timelineFrames,
  };
};
