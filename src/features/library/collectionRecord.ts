import type { CollectionRecord, GlobalConfig, ManifestEntry, VariableConfig } from "../../shared/types/visualization";

type BuildCollectionRecordOptions = {
  name: string;
  sourceCode: string;
  watchVariables: string[];
  globalConfig: GlobalConfig;
  variableConfigs: Record<string, VariableConfig>;
  savedManifest: ManifestEntry[];
};

export const buildCollectionRecord = ({
  name,
  sourceCode,
  watchVariables,
  globalConfig,
  variableConfigs,
  savedManifest,
}: BuildCollectionRecordOptions): CollectionRecord => ({
  id: crypto.randomUUID(),
  name,
  savedAt: new Date().toISOString(),
  sourceCode,
  watchVariables,
  globalConfig,
  variableConfigs,
  savedManifest,
});
