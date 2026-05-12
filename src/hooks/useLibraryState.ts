import { useCallback, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

import { buildCollectionRecord } from "../features/library/collectionRecord";
import { useCollections } from "./useCollections";
import type { CollectionRecord, ExampleRecord, GlobalConfig, ManifestEntry, VariableConfig } from "../shared/types/visualization";

type MessageApi = {
  success: (message: string) => void;
};

type UseLibraryStateOptions = {
  storageKey: string;
  defaultSnippet: string;
  defaultGlobalConfig: GlobalConfig;
  sourceCode: string;
  watchVariables: string[];
  globalConfig: GlobalConfig;
  variableConfigs: Record<string, VariableConfig>;
  manifest: ManifestEntry[];
  messageApi: MessageApi;
  persistWatchVariables: Dispatch<SetStateAction<string[]>>;
  persistVariableConfigs: Dispatch<SetStateAction<Record<string, VariableConfig>>>;
  persistSourceCode: Dispatch<SetStateAction<string>>;
  persistGlobalConfig: Dispatch<SetStateAction<GlobalConfig>>;
  persistManifest: Dispatch<SetStateAction<ManifestEntry[]>>;
  resetSelectionState: () => void;
  openVisualizationMain: () => void;
};

export const useLibraryState = ({
  storageKey,
  defaultSnippet,
  defaultGlobalConfig,
  sourceCode,
  watchVariables,
  globalConfig,
  variableConfigs,
  manifest,
  messageApi,
  persistWatchVariables,
  persistVariableConfigs,
  persistSourceCode,
  persistGlobalConfig,
  persistManifest,
  resetSelectionState,
  openVisualizationMain,
}: UseLibraryStateOptions) => {
  const { collections, persistCollections } = useCollections(storageKey);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [collectionName, setCollectionName] = useState("");

  const handleSaveCollection = useCallback(() => {
    const trimmed = collectionName.trim();
    if (!trimmed) {
      return;
    }
    const payload = buildCollectionRecord({
      name: trimmed,
      sourceCode,
      watchVariables,
      globalConfig,
      variableConfigs,
      savedManifest: manifest,
    });

    persistCollections([payload, ...collections]);
    setSaveModalOpen(false);
    setCollectionName("");
    messageApi.success(`Saved collection ${trimmed}.`);
  }, [collectionName, collections, globalConfig, manifest, messageApi, persistCollections, sourceCode, variableConfigs, watchVariables]);

  const handleLoadCollection = useCallback((record: CollectionRecord) => {
    persistSourceCode(record.sourceCode ?? defaultSnippet);
    persistWatchVariables(record.watchVariables ?? ["data"]);
    persistGlobalConfig(record.globalConfig ?? defaultGlobalConfig);
    persistVariableConfigs(record.variableConfigs ?? {});
    persistManifest(record.savedManifest ?? []);
    resetSelectionState();
    openVisualizationMain();
    messageApi.success(`Loaded ${record.name}.`);
  }, [
    defaultGlobalConfig,
    defaultSnippet,
    messageApi,
    openVisualizationMain,
    persistGlobalConfig,
    persistSourceCode,
    persistVariableConfigs,
    persistWatchVariables,
    persistManifest,
    resetSelectionState,
  ]);

  const handleDeleteCollection = useCallback((record: CollectionRecord) => {
    persistCollections(collections.filter((item) => item.id !== record.id));
    messageApi.success(`Deleted ${record.name}.`);
  }, [collections, messageApi, persistCollections]);

  const handleLoadExample = useCallback((example: ExampleRecord) => {
    persistSourceCode(example.snippet);
    persistWatchVariables(example.watchVariables ?? ["data"]);
    persistGlobalConfig((prev) => ({ ...defaultGlobalConfig, ...prev, ...(example.globalConfig ?? {}) }));
    persistVariableConfigs(example.variableConfigs ?? {});
    persistManifest([]);
    resetSelectionState();
    openVisualizationMain();
    messageApi.success(`Loaded example ${example.title}.`);
  }, [
    defaultGlobalConfig,
    messageApi,
    openVisualizationMain,
    persistGlobalConfig,
    persistSourceCode,
    persistVariableConfigs,
    persistWatchVariables,
    persistManifest,
    resetSelectionState,
  ]);

  return {
    collections,
    collectionName,
    saveModalOpen,
    setCollectionName,
    setSaveModalOpen,
    handleSaveCollection,
    handleLoadCollection,
    handleDeleteCollection,
    handleLoadExample,
  };
};
