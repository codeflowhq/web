import { useCallback, useState } from "react";

import { runVisualizationInBrowser } from "../lib/browserRuntime";
import { buildVisualizationRuntimeConfig } from "../lib/runtimeConfigPayload";
import { normalizeRuntimeError } from "../shared/errors/runtimeErrors";

export const useVisualizationRun = ({ globalConfig, sourceCode, variableConfigs, watchVariables }) => {
  const [manifest, setManifest] = useState([]);
  const [status, setStatus] = useState("idle");
  const [statusMessage, setStatusMessage] = useState("Provide code and run the visualizer.");

  const runVisualization = useCallback(async () => {
    setStatus("loading");
    setStatusMessage("Loading browser runtime…");
    try {
      const data = await runVisualizationInBrowser({
        snippet: sourceCode,
        watch: watchVariables.length ? watchVariables : undefined,
        config: buildVisualizationRuntimeConfig({ globalConfig, variableConfigs }),
      });
      setManifest(data.manifest ?? []);
      setStatus("ready");
      setStatusMessage("Visualization completed.");
    } catch (error) {
      console.error(error);
      setStatus("error");
      setStatusMessage(normalizeRuntimeError(error));
    }
  }, [globalConfig, sourceCode, variableConfigs, watchVariables]);

  return { manifest, runVisualization, setManifest, setStatusMessage, status, statusMessage };
};
