import { useMemo } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import { FolderOpenOutlined, DeleteOutlined, SettingOutlined } from "@ant-design/icons";

import {
  OUTPUT_FORMAT_OPTIONS,
  VIEW_KIND_OPTIONS,
  defaultVariableConfig,
} from "../configDefaults";
import { buildTypeDefaultRows, buildVariableConfigRows } from "../features/config/configPageState";
import type { CollectionRecord, ExampleRecord, GlobalConfig, VariableConfig, ViewKind } from "../shared/types/visualization";

type VariableConfigRow = VariableConfig & { variable: string };
type TypeDefaultRow = {
  key: string;
  label: string;
  viewKind: ViewKind | "auto";
};

type LibraryState = {
  collections: CollectionRecord[];
  handleLoadCollection: (record: CollectionRecord) => void;
  handleDeleteCollection: (record: CollectionRecord) => void;
  handleLoadExample: (example: ExampleRecord) => void;
};

export type ConfigPageProps = {
  globalConfig: GlobalConfig;
  setGlobalConfig: Dispatch<SetStateAction<GlobalConfig>>;
  variableConfigRows: VariableConfigRow[];
  configTableColumns: ColumnsType<VariableConfigRow>;
  outputFormatOptions: { label: string; value: string }[];
  viewKindOptions: ViewKind[];
};

export type LibraryPageProps = {
  collectionColumns: ColumnsType<CollectionRecord>;
  collections: CollectionRecord[];
  examples: ExampleRecord[];
  onLoadExample: (example: ExampleRecord) => void;
};

type UseConfigPageStateOptions = {
  manifestVariables: string[];
  variableConfigs: Record<string, VariableConfig>;
  globalConfig: GlobalConfig;
  setGlobalConfig: Dispatch<SetStateAction<GlobalConfig>>;
  handleOpenVariableConfig: (variable: string) => void;
  libraryState: LibraryState;
  examples: ExampleRecord[];
};

export const useConfigPageState = ({
  manifestVariables,
  variableConfigs,
  globalConfig,
  setGlobalConfig,
  handleOpenVariableConfig,
  libraryState,
  examples,
}: UseConfigPageStateOptions) => {
  const variableConfigRows = useMemo(
    () => buildVariableConfigRows(manifestVariables, variableConfigs, defaultVariableConfig),
    [manifestVariables, variableConfigs],
  );

  const configTableColumns = useMemo<ColumnsType<VariableConfigRow>>(
    () => [
      { title: "Variable", dataIndex: "variable", key: "variable" },
      { title: "View kind", dataIndex: "viewKind", key: "viewKind" },
      {
        title: "Depth",
        dataIndex: "depth",
        key: "depth",
        render: (value: VariableConfig["depth"]) => (value == null ? "inherit" : value),
      },
      {
        title: "Actions",
        key: "actions",
        render: (_unused, record) => (
          <Button icon={<SettingOutlined />} onClick={() => handleOpenVariableConfig(record.variable)}>
            Edit
          </Button>
        ),
      },
    ],
    [handleOpenVariableConfig],
  );

  const collectionColumns = useMemo<ColumnsType<CollectionRecord>>(
    () => [
      { title: "Name", dataIndex: "name", key: "name" },
      { title: "Saved", dataIndex: "savedAt", key: "savedAt", render: (value: string) => new Date(value).toLocaleString() },
      { title: "Watches", key: "watchVariables", render: (_unused, record) => record.watchVariables?.join(", ") ?? "" },
      { title: "Saved visuals", key: "savedManifest", render: (_unused, record) => `${record.savedManifest?.length ?? 0} panel(s)` },
      {
        title: "Actions",
        key: "actions",
        render: (_unused, record) => (
          <>
            <Button icon={<FolderOpenOutlined />} onClick={() => libraryState.handleLoadCollection(record)}>Load</Button>
            <Button danger icon={<DeleteOutlined />} onClick={() => libraryState.handleDeleteCollection(record)} style={{ marginLeft: 8 }}>Delete</Button>
          </>
        ),
      },
    ],
    [libraryState],
  );

  const configPageProps = useMemo<ConfigPageProps>(() => ({
    globalConfig,
    setGlobalConfig,
    variableConfigRows,
    configTableColumns,
    outputFormatOptions: OUTPUT_FORMAT_OPTIONS,
    viewKindOptions: VIEW_KIND_OPTIONS,
  }), [configTableColumns, globalConfig, setGlobalConfig, variableConfigRows]);

  const libraryPageProps = useMemo<LibraryPageProps>(() => ({
    collectionColumns,
    collections: libraryState.collections,
    examples,
    onLoadExample: libraryState.handleLoadExample,
  }), [collectionColumns, examples, libraryState.collections, libraryState.handleLoadExample]);

  const typeDefaultRows = useMemo<TypeDefaultRow[]>(
    () => buildTypeDefaultRows(globalConfig.typeViewDefaults),
    [globalConfig.typeViewDefaults],
  );

  return {
    collectionColumns,
    configPageProps,
    libraryPageProps,
    typeDefaultRows,
    variableConfigRows,
  };
};
