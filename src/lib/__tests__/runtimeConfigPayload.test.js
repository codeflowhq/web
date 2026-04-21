import { describe, expect, it } from "vitest";

import { defaultGlobalConfig, defaultVariableConfig } from "../../configDefaults";
import { buildVisualizationRuntimeConfig } from "../runtimeConfigPayload";

describe("buildVisualizationRuntimeConfig", () => {
  it("splits runtime packages and wheels into clean install lists", () => {
    const config = buildVisualizationRuntimeConfig({
      globalConfig: {
        ...defaultGlobalConfig,
        runtimePackages: "humanize, more-itertools,  ",
        runtimeWheels: "pyodide/wheels/custom-0.1.0-py3-none-any.whl, https://example.com/extra.whl",
      },
      variableConfigs: {},
    });

    expect(config.runtime_packages).toEqual(["humanize", "more-itertools"]);
    expect(config.runtime_wheels).toEqual([
      "pyodide/wheels/custom-0.1.0-py3-none-any.whl",
      "https://example.com/extra.whl",
    ]);
  });

  it("preserves variable overrides without emitting inherited depth", () => {
    const config = buildVisualizationRuntimeConfig({
      globalConfig: defaultGlobalConfig,
      variableConfigs: {
        data: { ...defaultVariableConfig, viewKind: "table", depth: 3, maxSteps: 5 },
        item: { ...defaultVariableConfig, viewKind: "auto", depth: null, maxSteps: null },
      },
    });

    expect(config.variable_configs.data).toMatchObject({
      view_kind: "table",
      depth: 3,
      max_steps: 5,
    });
    expect(config.variable_configs.item).toEqual({
      view_kind: "auto",
      max_steps: null,
      view_options: defaultVariableConfig.viewOptions,
    });
  });
});
