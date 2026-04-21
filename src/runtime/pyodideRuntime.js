import { resolveAssetUrl } from "./assets";
import { PYTHON_BOOTSTRAP } from "./pythonBootstrap";

const PYODIDE_VERSION = "0.27.5";
const PYODIDE_CDN = "https://cdn.jsdelivr.net/pyodide/v" + PYODIDE_VERSION + "/full/pyodide.js";
const RUNTIME_CONFIG_URL = resolveAssetUrl("pyodide/runtime-config.json");

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
    return;
  }

  ensureDirectory(pyodide, "/code_visualizer_runtime");
  for (const entry of sources) {
    if (entry.url === undefined || entry.path === undefined) {
      throw new Error("Each pythonSources entry needs both url and path.");
    }
    const sourceUrl = resolveAssetUrl(entry.url);
    const response = await fetch(sourceUrl);
    if (response.ok !== true) {
      throw new Error("Failed to fetch Python source: " + sourceUrl);
    }
    const content = await response.text();
    const targetPath = "/code_visualizer_runtime/" + entry.path;
    const directory = targetPath.split("/").slice(0, -1).join("/");
    console.log("[pyodide] writing", targetPath, "from", sourceUrl);
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
  if (value.startsWith("/") || value.startsWith("./") || value.startsWith("pyodide/") || value.endsWith(".whl")) {
    return resolveAssetUrl(value);
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

export const installMicropipPackages = async (pyodide, packages) => {
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

export const bootstrapRuntime = async () => {
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
