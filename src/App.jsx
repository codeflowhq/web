import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { App as AntApp, Button, Card, Layout, Menu, Modal, Typography } from "antd";
import { DeleteOutlined, FolderOpenOutlined, SettingOutlined } from "@ant-design/icons";

import { initializeBrowserRuntime } from "./lib/browserRuntime";
import { EXAMPLE_LIBRARY, defaultSnippet } from "./data/examples";
import {
  extractCandidateVariables,
  isPythonIdentifier,
  isWatchExpression,
} from "./lib/watchExpressions";
import {
  COLLECTIONS_STORAGE_KEY,
  CONVERTER_OPTIONS,
  defaultGlobalConfig,
  defaultVariableConfig,
  OUTPUT_FORMAT_OPTIONS,
  SHARE_PARAM,
  VIEW_KIND_OPTIONS,
} from "./configDefaults";
import { useCollections } from "./hooks/useCollections";
import { useTimelinePlayback } from "./hooks/useTimelinePlayback";
import { useEditorDecorations } from "./hooks/useEditorDecorations";
import { useShareState } from "./hooks/useShareState";
import { useVisualizationRun } from "./hooks/useVisualizationRun";
import { useVariableWatch } from "./hooks/useVariableWatch";
import "antd/dist/reset.css";
import "./App.css";

const VisualizationMainPage = lazy(() => import("./components/VisualizationMainPage"));
const VisualizationConfigPage = lazy(() => import("./components/VisualizationConfigPage"));
const LibraryPage = lazy(() => import("./components/LibraryPage"));
const VariableConfigDrawer = lazy(() => import("./components/VariableConfigDrawer"));
const SaveCollectionModal = lazy(() => import("./components/SaveCollectionModal"));

const { Header, Sider, Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const buildCollectionPayload = ({ name, sourceCode, watchVariables, globalConfig, variableConfigs }) => ({
  id: crypto.randomUUID(),
  name,
  savedAt: new Date().toISOString(),
  sourceCode,
  watchVariables,
  globalConfig,
  variableConfigs,
});

function App() {
  const { message: messageApi } = AntApp.useApp();
  const [modal, modalContextHolder] = Modal.useModal();
  const [topMenuKey, setTopMenuKey] = useState("visualization");
  const [vizMenuKey, setVizMenuKey] = useState("main");
  const [sourceCode, setSourceCode] = useState(defaultSnippet);
  const [globalConfig, setGlobalConfig] = useState(defaultGlobalConfig);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [collectionName, setCollectionName] = useState("");
  const {
    closeConfigDrawer,
    configDrawerOpen,
    configDrawerVariable,
    handleAddWatchVariable,
    handleOpenVariableConfig,
    handleSubmitWatchExpression,
    handleVariableConfigChange,
    pendingWatchVariable,
    selectedVariable,
    selectionLocked,
    setPendingWatchVariable,
    setSelectedVariable,
    setSelectionLocked,
    setVariableConfigs,
    setWatchDraft,
    setWatchVariables,
    variableConfigs,
    watchDraft,
    watchVariables,
  } = useVariableWatch({
    defaultVariableConfig,
    initialWatchVariables: ["data"],
    isWatchExpression,
    messageApi,
  });
  const lastErrorRef = useRef("");

  const { manifest, runVisualization, setStatusMessage, status, statusMessage } = useVisualizationRun({
    globalConfig,
    sourceCode,
    variableConfigs,
    watchVariables,
  });
  const { collections, persistCollections } = useCollections(COLLECTIONS_STORAGE_KEY);
  const {
    activeTimelineFrame,
    activeTimelineIndex,
    activeTimelineKey,
    isPlaying,
    setActiveTimelineKey,
    setIsPlaying,
    stepTo,
    timelineFrames,
  } = useTimelinePlayback(manifest);

  const manifestVariables = useMemo(() => manifest.map((entry) => entry.variable), [manifest]);
  const candidateVariables = useMemo(() => extractCandidateVariables(sourceCode), [sourceCode]);
  const variableConfigRows = useMemo(
    () => manifestVariables.map((variable) => ({ variable, ...(variableConfigs[variable] ?? defaultVariableConfig) })),
    [manifestVariables, variableConfigs],
  );

  const activeExecutionLine = useMemo(() => {
    for (const entry of manifest) {
      const step = entry.steps.find((candidate) => candidate.timelineKey === activeTimelineKey);
      if (step?.meta?.line_number) {
        return Number(step.meta.line_number);
      }
    }
    return null;
  }, [activeTimelineKey, manifest]);

  const { handleEditorMount } = useEditorDecorations({
    activeExecutionLine,
    isPythonIdentifier,
    onIdentifierClick: (identifier) => {
      setSelectedVariable(identifier);
      if (selectionLocked) {
        handleAddWatchVariable(identifier, { openConfig: true });
      }
    },
    selectionEnabled: selectionLocked,
  });

  const { handleShare } = useShareState({
    defaultGlobalConfig,
    defaultSnippet,
    globalConfig,
    messageApi,
    setGlobalConfig,
    setSourceCode,
    setStatusMessage,
    setTopMenuKey,
    setVariableConfigs,
    setVizMenuKey,
    setWatchVariables,
    shareParam: SHARE_PARAM,
    sourceCode,
    variableConfigs,
    watchVariables,
  });

  useEffect(() => {
    initializeBrowserRuntime().catch((error) => {
      console.error(error);
    });
  }, []);

  useEffect(() => {
    if (selectedVariable && !candidateVariables.includes(selectedVariable) && !watchVariables.includes(selectedVariable)) {
      setSelectedVariable(null);
    }
  }, [candidateVariables, selectedVariable, setSelectedVariable, watchVariables]);

  useEffect(() => {
    window.__lastManifest = manifest;
  }, [manifest]);

  useEffect(() => {
    if (status !== "error") {
      lastErrorRef.current = "";
      return;
    }
    if (!statusMessage || lastErrorRef.current === statusMessage) {
      return;
    }
    lastErrorRef.current = statusMessage;
    modal.error({
      title: "Visualization failed",
      content: statusMessage,
    });
  }, [modal, status, statusMessage]);

  const handleSaveCollection = useCallback(() => {
    const trimmed = collectionName.trim();
    if (!trimmed) {
      return;
    }
    const payload = buildCollectionPayload({
      name: trimmed,
      sourceCode,
      watchVariables,
      globalConfig,
      variableConfigs,
    });
    persistCollections([payload, ...collections]);
    setSaveModalOpen(false);
    setCollectionName("");
    messageApi.success(`Saved collection ${trimmed}.`);
  }, [collectionName, collections, globalConfig, messageApi, persistCollections, sourceCode, variableConfigs, watchVariables]);

  const handleLoadCollection = useCallback(
    (record) => {
      setSourceCode(record.sourceCode ?? defaultSnippet);
      setWatchVariables(record.watchVariables ?? ["data"]);
      setGlobalConfig(record.globalConfig ?? defaultGlobalConfig);
      setVariableConfigs(record.variableConfigs ?? {});
      setSelectedVariable(null);
      setSelectionLocked(false);
      setTopMenuKey("visualization");
      setVizMenuKey("main");
      messageApi.success(`Loaded ${record.name}.`);
    },
    [messageApi, setSelectedVariable, setSelectionLocked, setVariableConfigs, setWatchVariables],
  );

  const handleDeleteCollection = useCallback((record) => {
    persistCollections(collections.filter((item) => item.id !== record.id));
    messageApi.success(`Deleted ${record.name}.`);
  }, [collections, messageApi, persistCollections]);

  const handleLoadExample = useCallback(
    (example) => {
      setSourceCode(example.snippet);
      setWatchVariables(example.watchVariables ?? ["data"]);
      setGlobalConfig((prev) => ({ ...defaultGlobalConfig, ...prev, ...(example.globalConfig ?? {}) }));
      setVariableConfigs(example.variableConfigs ?? {});
      setSelectedVariable(null);
      setSelectionLocked(false);
      setTopMenuKey("visualization");
      setVizMenuKey("main");
      messageApi.success(`Loaded example ${example.title}.`);
    },
    [messageApi, setSelectedVariable, setSelectionLocked, setVariableConfigs, setWatchVariables],
  );

  const configTableColumns = useMemo(
    () => [
      { title: "Variable", dataIndex: "variable", key: "variable" },
      { title: "View kind", dataIndex: "viewKind", key: "viewKind" },
      {
        title: "Depth",
        dataIndex: "depth",
        key: "depth",
        render: (value) => (value == null ? "inherit" : value),
      },
      {
        title: "Max steps",
        dataIndex: "maxSteps",
        key: "maxSteps",
        render: (value) => value ?? "inherit",
      },
      {
        title: "Actions",
        key: "actions",
        render: (_unused, record) => <Button icon={<SettingOutlined />} onClick={() => handleOpenVariableConfig(record.variable)}>Edit</Button>,
      },
    ],
    [handleOpenVariableConfig],
  );

  const collectionColumns = useMemo(
    () => [
      { title: "Name", dataIndex: "name", key: "name" },
      { title: "Saved", dataIndex: "savedAt", key: "savedAt", render: (value) => new Date(value).toLocaleString() },
      { title: "Watches", key: "watchVariables", render: (_unused, record) => record.watchVariables?.join(", ") ?? "" },
      {
        title: "Actions",
        key: "actions",
        render: (_unused, record) => (
          <>
            <Button icon={<FolderOpenOutlined />} onClick={() => handleLoadCollection(record)}>Load</Button>
            <Button danger icon={<DeleteOutlined />} onClick={() => handleDeleteCollection(record)} style={{ marginLeft: 8 }}>Delete</Button>
          </>
        ),
      },
    ],
    [handleDeleteCollection, handleLoadCollection],
  );

  const handleRunVisualization = useCallback(async () => {
    closeConfigDrawer();
    await runVisualization();
  }, [closeConfigDrawer, runVisualization]);

  const sideMenuKeys = topMenuKey === "library" ? [] : [vizMenuKey];
  const handleSideMenuClick = useCallback(({ key }) => {
    setTopMenuKey("visualization");
    setVizMenuKey(key);
  }, []);

  const editorOptions = useMemo(
    () => ({
      minimap: { enabled: false },
      fontSize: 14,
      scrollBeyondLastLine: false,
      wordWrap: "on",
      automaticLayout: true,
      glyphMargin: true,
      padding: { top: 12, bottom: 12 },
    }),
    [],
  );

  return (
    <>
      <Layout className="app-layout">
        <Header className="app-header">
          <div className="app-brand">
            <Title level={3} style={{ margin: 0, color: "#fff" }}>CodeFlow</Title>
            <Text style={{ color: "rgba(255,255,255,0.7)" }}>interactive tracing workspace</Text>
          </div>
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[topMenuKey]}
            onClick={({ key }) => setTopMenuKey(key)}
            items={[
              { key: "visualization", label: "Visualization" },
              { key: "library", label: "Library" },
            ]}
          />
        </Header>

        <Layout>
          <Sider width={220} theme="light" className="app-sider">
            <Menu
              mode="inline"
              selectedKeys={sideMenuKeys}
              onClick={handleSideMenuClick}
              items={[
                { key: "main", label: "Main" },
                { key: "config", label: "Config" },
              ]}
            />
          </Sider>

          <Content className="app-content">
            <div className="page-copy">
              <Paragraph type="secondary" style={{ marginBottom: 8 }}>Status: {statusMessage}</Paragraph>
              {topMenuKey === "visualization" && vizMenuKey === "main" ? (
                <Suspense fallback={<Card className="surface-card" loading />}>
                  <VisualizationMainPage
                    activeTimelineFrame={activeTimelineFrame}
                    activeTimelineIndex={activeTimelineIndex}
                    candidateVariables={candidateVariables}
                    editorOptions={editorOptions}
                    handleAddWatchVariable={handleAddWatchVariable}
                    handleEditorMount={handleEditorMount}
                    handleOpenVariableConfig={handleOpenVariableConfig}
                    handleShare={handleShare}
                    handleSubmitWatchExpression={handleSubmitWatchExpression}
                    isPlaying={isPlaying}
                    manifest={manifest}
                    runVisualization={handleRunVisualization}
                    selectedVariable={selectedVariable}
                    selectionLocked={selectionLocked}
                    setActiveTimelineKey={setActiveTimelineKey}
                    setIsPlaying={setIsPlaying}
                    setSaveModalOpen={setSaveModalOpen}
                    setSelectedVariable={setSelectedVariable}
                    setSelectionLocked={setSelectionLocked}
                    setSourceCode={setSourceCode}
                    setTopMenuKey={setTopMenuKey}
                    setWatchDraft={setWatchDraft}
                    setWatchVariables={setWatchVariables}
                    sourceCode={sourceCode}
                    status={status}
                    stepTo={stepTo}
                    timelineFrames={timelineFrames}
                    variableConfigs={Object.fromEntries(manifestVariables.map((name) => [name, variableConfigs[name] ?? defaultVariableConfig]))}
                    watchDraft={watchDraft}
                    watchVariables={watchVariables}
                  />
                </Suspense>
              ) : null}
              {topMenuKey === "visualization" && vizMenuKey === "config" ? (
                <Suspense fallback={<Card className="surface-card" loading />}>
                  <VisualizationConfigPage
                    globalConfig={globalConfig}
                    setGlobalConfig={setGlobalConfig}
                    variableConfigRows={variableConfigRows}
                    configTableColumns={configTableColumns}
                    outputFormatOptions={OUTPUT_FORMAT_OPTIONS}
                    converterOptions={CONVERTER_OPTIONS}
                    viewKindOptions={VIEW_KIND_OPTIONS}
                  />
                </Suspense>
              ) : null}
              {topMenuKey === "library" ? (
                <Suspense fallback={<Card className="surface-card" loading />}>
                  <LibraryPage
                    collectionColumns={collectionColumns}
                    collections={collections}
                    examples={EXAMPLE_LIBRARY}
                    onLoadExample={handleLoadExample}
                  />
                </Suspense>
              ) : null}
            </div>
          </Content>
        </Layout>
      </Layout>

      {modalContextHolder}
      <Suspense fallback={null}>
        <VariableConfigDrawer
          open={configDrawerOpen}
          messageApi={messageApi}
          variableName={configDrawerVariable}
          variableConfig={configDrawerVariable ? (variableConfigs[configDrawerVariable] ?? defaultVariableConfig) : defaultVariableConfig}
          defaultVariableConfig={defaultVariableConfig}
          viewKindOptions={VIEW_KIND_OPTIONS}
          pendingWatchVariable={pendingWatchVariable}
          onClose={closeConfigDrawer}
          onChange={handleVariableConfigChange}
          setVariableConfigs={setVariableConfigs}
          setWatchVariables={setWatchVariables}
          setPendingWatchVariable={setPendingWatchVariable}
        />
        <SaveCollectionModal
          open={saveModalOpen}
          collectionName={collectionName}
          setCollectionName={setCollectionName}
          onCancel={() => setSaveModalOpen(false)}
          onOk={handleSaveCollection}
        />
      </Suspense>
    </>
  );
}

const AppShell = () => (
  <AntApp>
    <App />
  </AntApp>
);

export default AppShell;
