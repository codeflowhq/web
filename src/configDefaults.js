export const COLLECTIONS_STORAGE_KEY = "codeflow.collections.v1";
export const SHARE_PARAM = "viz";

export const VIEW_KIND_OPTIONS = [
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
export const CONVERTER_OPTIONS = [
  { label: "default", value: "default" },
  { label: "auto", value: "auto" },
];

export const defaultGlobalConfig = {
  stepLimit: 12,
  outputFormat: "svg",
  maxDepth: 3,
  maxItemsPerView: 50,
  recursionDepthDefault: -1,
  autoRecursionDepthCap: 6,
  showTitles: false,
  converter: "default",
  runtimePackages: "",
  runtimeWheels: "",
  typeViewDefaults: {},
};

export const defaultVariableConfig = {
  viewKind: "auto",
  depth: null,
  maxSteps: null,
  viewOptions: {
    barColor: "#2563eb",
  },
};

export const GRID_ROW_HEIGHT = 36;
export const GRID_MARGIN = [12, 12];

export const mergeLayouts = (previousLayouts, variables) => {
  const current = previousLayouts?.lg ?? [];
  const byId = new Map(current.map((item) => [item.i, item]));
  return {
    lg: variables.map((variable, index) => {
      const existing = byId.get(variable);
      if (existing) {
        return { ...existing, minW: 3, minH: 4 };
      }
      return {
        i: variable,
        x: (index % 2) * 6,
        y: Math.floor(index / 2) * 8,
        w: 6,
        h: 8,
        minW: 3,
        minH: 6,
      };
    }),
  };
};


export const TYPE_VIEW_DEFAULT_ROWS = [
  { key: "list[any]", label: "List / array" },
  { key: "tuple[list]", label: "Matrix" },
  { key: "dict[str, any]", label: "Dictionary / object" },
  { key: "linked_list", label: "Linked list" },
  { key: "tree", label: "Tree" },
  { key: "graph", label: "Graph" },
];
