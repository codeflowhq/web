import type { GlobalConfig, VariableConfig, ViewKind } from "./shared/types/visualization";

export const COLLECTIONS_STORAGE_KEY = "codeflow.collections.v1";
export const SHARE_PARAM = "viz";

export const VIEW_KIND_OPTIONS: ViewKind[] = [
  "auto",
  "array_cells",
  "matrix",
  "table",
  "hash_table",
  "linked_list",
  "heap_dual",
  "bar",
  "tree",
  "graph",
  "image",
];

export const OUTPUT_FORMAT_OPTIONS = ["dot", "svg", "png", "jpg"].map((value) => ({ label: value, value }));

export const defaultGlobalConfig: GlobalConfig = {
  stepLimit: 12,
  outputFormat: "svg",
  maxDepth: 3,
  maxItemsPerView: 50,
  recursionDepthDefault: -1,
  autoRecursionDepthCap: 6,
  showTitles: false,
  customConverters: "",
  runtimePackages: "",
  runtimeWheels: "",
  typeViewDefaults: {},
};

export const defaultVariableConfig: VariableConfig = {
  viewKind: "auto",
  depth: null,
  viewOptions: {
    barColor: "#2563eb",
  },
};

export const TYPE_VIEW_DEFAULT_ROWS: Array<{ key: string; label: string }> = [
  { key: "list[any]", label: "List / array" },
  { key: "tuple[list]", label: "Matrix" },
  { key: "dict[str, any]", label: "Dictionary / object" },
  { key: "linked_list", label: "Linked list" },
  { key: "tree", label: "Tree" },
  { key: "graph", label: "Graph" },
];
