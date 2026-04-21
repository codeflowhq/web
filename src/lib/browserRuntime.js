export { bootstrapRuntime as initializeBrowserRuntime } from "../runtime/pyodideRuntime";

import { normalizeManifest } from "../runtime/manifestNormalizer";
import { bootstrapRuntime, installMicropipPackages } from "../runtime/pyodideRuntime";

export const runVisualizationInBrowser = async ({ snippet, watch, config }) => {
  const pyodide = await bootstrapRuntime();
  await installMicropipPackages(pyodide, config?.runtime_packages ?? []);
  await installMicropipPackages(pyodide, config?.runtime_wheels ?? []);
  const runner = pyodide.globals.get("run_visualization");
  try {
    const result = runner(
      JSON.stringify({
        snippet,
        watch,
        config: {
          ...config,
          output_format: (config && config.output_format) || "svg",
        },
      }),
    );
    const parsed = JSON.parse(result);
    return normalizeManifest(parsed);
  } finally {
    runner.destroy();
  }
};
