import { useCallback, useState } from "react";

import { runVisualizationInBrowser } from "../lib/browserRuntime";
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
        config: {
          step_limit: globalConfig.stepLimit,
          output_format: globalConfig.outputFormat,
          max_depth: globalConfig.maxDepth,
          max_items_per_view: globalConfig.maxItemsPerView,
          recursion_depth_default: globalConfig.recursionDepthDefault,
          auto_recursion_depth_cap: globalConfig.autoRecursionDepthCap,
          show_titles: globalConfig.showTitles,
          converter: globalConfig.converter,
          type_view_defaults: globalConfig.typeViewDefaults ?? {},
          runtime_packages: globalConfig.runtimePackages
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean),
          runtime_wheels: globalConfig.runtimeWheels
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean),
          variable_configs: Object.fromEntries(
            Object.entries(variableConfigs).map(([variableName, config]) => [
              variableName,
              {
                view_kind: config.viewKind,
                ...(config.depth != null ? { depth: config.depth } : {}),
                max_steps: config.maxSteps,
                view_options: config.viewOptions,
              },
            ]),
          ),
        },
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
