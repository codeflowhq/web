const PYODIDE_VERSION = "0.27.5";
const PYODIDE_CDN = "https://cdn.jsdelivr.net/pyodide/v" + PYODIDE_VERSION + "/full/pyodide.js";
const RUNTIME_CONFIG_URL = "/pyodide/runtime-config.json";

const PYTHON_BOOTSTRAP_LINES = [
  "import json",
  "import sys",
  'from pathlib import Path',
  '',
  '_RUNTIME_ROOT = Path("/code_visualizer_runtime")',
  'if str(_RUNTIME_ROOT) not in sys.path:',
  '    sys.path.insert(0, str(_RUNTIME_ROOT))',
  '',
  'def _require_browser_dependencies():',
  '    diagnostics = []',
  '    checks = [',
  '        ("step_tracer", "import step_tracer"),',
  '        ("step_tracer.StepTracer", "from step_tracer import StepTracer"),',
  '        ("query_engine", "import query_engine"),',
  '        ("query_engine.QueryEngine", "from query_engine import QueryEngine"),',
  '    ]',
  '    for label, statement in checks:',
  '        try:',
  '            exec(statement, globals())',
  '        except Exception as exc:',
  '            diagnostics.append(f"{label}: {exc!r}")',
  '    if diagnostics:',
  '        raise RuntimeError("Browser dependency import failed:\\n" + "\\n".join(diagnostics))',
  '',
  '_require_browser_dependencies()',
  '',
  'from code_visualizer import ViewKind, default_visualizer_config, visualize_algorithm_manifest_payload',
  '',
  'def run_visualization(payload_json: str):',
  '    payload = json.loads(payload_json)',
  '    config_payload = payload.get("config") or {}',
  '    config = default_visualizer_config()',
  '',
  '    step_limit = config_payload.get("step_limit")',
  '    if step_limit is not None:',
  '        config.trace_step_limit_default = step_limit',
  '',
  '    output_format = config_payload.get("output_format")',
  '    if output_format:',
  '        config.output_format = output_format',
  '',
  '    max_depth = config_payload.get("max_depth")',
  '    if max_depth is not None:',
  '        config.max_depth = max_depth',
  '',
  '    max_items_per_view = config_payload.get("max_items_per_view")',
  '    if max_items_per_view is not None:',
  '        config.max_items_per_view = max_items_per_view',
  '',
  '    recursion_depth_default = config_payload.get("recursion_depth_default")',
  '    if recursion_depth_default is not None:',
  '        config.recursion_depth_default = recursion_depth_default',
  '',
  '    auto_recursion_depth_cap = config_payload.get("auto_recursion_depth_cap")',
  '    if auto_recursion_depth_cap is not None:',
  '        config.auto_recursion_depth_cap = auto_recursion_depth_cap',
  '',
  '    show_titles = config_payload.get("show_titles")',
  '    if show_titles is not None:',
  '        config.show_titles = bool(show_titles)',
  '',
  '    type_view_defaults = config_payload.get("type_view_defaults") or {}',
  '    for type_pattern, view_kind in type_view_defaults.items():',
  '        if view_kind and view_kind != "auto":',
  '            config.view_type_map[type_pattern] = ViewKind(view_kind)',
  '',
  '    variable_configs = config_payload.get("variable_configs") or {}',
  '    for variable_name, variable_config in variable_configs.items():',
  '        view_kind = variable_config.get("view_kind")',
  '        if view_kind and view_kind != "auto":',
  '            config.view_name_map[variable_name] = ViewKind(view_kind)',
  '        depth = variable_config.get("depth")',
  '        if depth is not None:',
  '            config.recursion_depth_map[variable_name] = depth',
  '        max_steps = variable_config.get("max_steps")',
  '        if max_steps is not None:',
  '            config.trace_step_limit_map[variable_name] = max_steps',
  '',
  '    result = visualize_algorithm_manifest_payload(',
  '        payload["snippet"],',
  '        watch_variables=payload.get("watch"),',
  '        config=config,',
  '    )',
  '    return json.dumps(result)',
];

const PYTHON_BOOTSTRAP = PYTHON_BOOTSTRAP_LINES.join("\n");

let pyodidePromise;
let runtimePromise;
let runtimeConfigPromise;
const installedDynamicPackages = new Set();

const loadScript = (src) =>
  new Promise((resolve, reject) => {
    const selector = 'script[data-pyodide-src="' + src + '"]';
    const existing = document.querySelector(selector);
    if (existing) {
      existing.addEventListener("load", resolve, { once: true });
      existing.addEventListener("error", () => reject(new Error("Failed to load Pyodide script.")), { once: true });
      if (window.loadPyodide !== undefined) {
        resolve();
      }
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.dataset.pyodideSrc = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Pyodide script."));
    document.head.appendChild(script);
  });

const getPyodide = async () => {
  if (pyodidePromise === undefined) {
    pyodidePromise = (async () => {
      await loadScript(PYODIDE_CDN);
      if (window.loadPyodide === undefined) {
        throw new Error("Pyodide did not expose loadPyodide on window.");
      }
      return window.loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v" + PYODIDE_VERSION + "/full/",
      });
    })();
  }
  return pyodidePromise;
};

const getRuntimeConfig = async () => {
  if (runtimeConfigPromise === undefined) {
    runtimeConfigPromise = fetch(RUNTIME_CONFIG_URL).then(async (response) => {
      if (response.ok !== true) {
        throw new Error("Missing browser runtime config at " + RUNTIME_CONFIG_URL + ".");
      }
      return response.json();
    });
  }
  return runtimeConfigPromise;
};

const ensureDirectory = (pyodide, path) => {
  const parts = path.split("/").filter(Boolean);
  let cursor = "";
  for (const part of parts) {
    cursor += "/" + part;
    try {
      const stat = pyodide.FS.stat(cursor);
      if (pyodide.FS.isDir(stat.mode) !== true) {
        throw new Error("Path exists but is not a directory: " + cursor);
      }
    } catch (error) {
      if (error instanceof Error && error.message.startsWith("Path exists but is not a directory:")) {
        throw error;
      }
      pyodide.FS.mkdir(cursor);
    }
  }
};

const writePythonSources = async (pyodide, sources) => {
  if (sources.length === 0) {
    throw new Error(
      "Browser mode needs bundled Python sources or wheels. Add entries to public/pyodide/runtime-config.json.",
    );
  }

  ensureDirectory(pyodide, "/code_visualizer_runtime");
  for (const entry of sources) {
    if (entry.url === undefined || entry.path === undefined) {
      throw new Error("Each pythonSources entry needs both url and path.");
    }
    const response = await fetch(entry.url);
    if (response.ok !== true) {
      throw new Error("Failed to fetch Python source: " + entry.url);
    }
    const content = await response.text();
    const targetPath = "/code_visualizer_runtime/" + entry.path;
    const directory = targetPath.split("/").slice(0, -1).join("/");
    console.log("[pyodide] writing", targetPath, "from", entry.url);
    try {
      ensureDirectory(pyodide, directory);
      pyodide.FS.writeFile(targetPath, content, { encoding: "utf8" });
    } catch (error) {
      throw new Error("Failed while writing Python source to " + targetPath + ": " + String(error));
    }
  }
};

const toInstallSpecifier = (value) => {
  if (typeof value !== "string") {
    return value;
  }
  if (value.startsWith("/")) {
    return new URL(value, window.location.origin).toString();
  }
  return value;
};

const isWheelSpecifier = (value) => typeof value === "string" && value.endsWith(".whl");

const BLOCKED_DYNAMIC_PACKAGES = new Set([
  "code_visualizer",
  "code-visualizer",
  "step_tracer",
  "step-tracer",
  "query_engine",
  "query-engine",
]);

const shouldSkipDynamicPackage = (value) => {
  if (typeof value !== "string") {
    return false;
  }
  const normalized = value.trim().toLowerCase();
  if (!normalized) {
    return true;
  }
  return BLOCKED_DYNAMIC_PACKAGES.has(normalized);
};

const installMicropipPackages = async (pyodide, packages) => {
  const normalized = (packages ?? [])
    .filter(Boolean)
    .filter((pkg) => shouldSkipDynamicPackage(pkg) === false)
    .map((pkg) => toInstallSpecifier(pkg))
    .filter((pkg) => installedDynamicPackages.has(pkg) === false);
  if (normalized.length === 0) {
    return;
  }
  await pyodide.loadPackage("micropip");
  const micropip = pyodide.pyimport("micropip");
  try {
    for (const pkg of normalized) {
      const options = isWheelSpecifier(pkg) ? { deps: false } : undefined;
      await micropip.install(pkg, options);
      installedDynamicPackages.add(pkg);
    }
  } finally {
    micropip.destroy();
  }
};

const bootstrapRuntime = async () => {
  if (runtimePromise === undefined) {
    runtimePromise = (async () => {
      const [pyodide, runtimeConfig] = await Promise.all([getPyodide(), getRuntimeConfig()]);
      const pyodidePackages = runtimeConfig.pyodidePackages ?? [];
      if (pyodidePackages.length > 0) {
        await pyodide.loadPackage(pyodidePackages);
      }
      await installMicropipPackages(pyodide, runtimeConfig.micropipPackages ?? []);
      await installMicropipPackages(pyodide, runtimeConfig.wheelUrls ?? []);
      await writePythonSources(pyodide, runtimeConfig.pythonSources ?? []);
      pyodide.runPython(PYTHON_BOOTSTRAP);
      return pyodide;
    })();
  }
  return runtimePromise;
};

const normalizeManifest = (payload) => ({
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

export const initializeBrowserRuntime = () => bootstrapRuntime();

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
