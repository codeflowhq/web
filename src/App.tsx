import { Suspense, lazy, useCallback, useMemo, useState } from "react";
import type { editor } from "monaco-editor";
import { App as AntApp, Button, Divider, Layout, Menu, Modal, Space, Typography } from "antd";
import { SaveOutlined, ShareAltOutlined } from "@ant-design/icons";

import { EXAMPLE_LIBRARY, defaultSnippet } from "./data/examples";
import {
  extractCandidateVariables,
  isPythonIdentifier,
  isWatchExpression,
} from "./lib/watchExpressions";
import {
  COLLECTIONS_STORAGE_KEY,
  defaultGlobalConfig,
  defaultVariableConfig,
  SHARE_PARAM,
  VIEW_KIND_OPTIONS,
} from "./configDefaults";
import { useEditorDecorations } from "./hooks/useEditorDecorations";
import { useConfigPageState } from "./hooks/useConfigPageState";
import { useRuntimeBootstrap } from "./hooks/useRuntimeBootstrap";
import { useShareState } from "./hooks/useShareState";
import { useTimelinePlayback } from "./hooks/useTimelinePlayback";
import { useVariableWatch } from "./hooks/useVariableWatch";
import { useVisualizationRun } from "./hooks/useVisualizationRun";
import { useLibraryState } from "./hooks/useLibraryState";
import { useNavigationState } from "./hooks/useNavigationState";
import { NavigationContent } from "./features/navigation/NavigationContent";
import { AppErrorBoundary } from "./components/AppErrorBoundary";
import { useGlobalErrorHandling } from "./hooks/useGlobalErrorHandling";
import { TOP_MENU_LIBRARY } from "./features/navigation/navigationState";
import "antd/dist/reset.css";
import "./App.css";

const VariableConfigDrawer = lazy(() => import("./components/VariableConfigDrawer"));
const SaveCollectionModal = lazy(() => import("./components/SaveCollectionModal"));

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

function App() {
  const { message: messageApi } = AntApp.useApp();
  const [modal, modalContextHolder] = Modal.useModal();
  const [sourceCode, setSourceCode] = useState(defaultSnippet);
  const [globalConfig, setGlobalConfig] = useState(defaultGlobalConfig);
  const navigation = useNavigationState();

  const showErrorModal = useCallback((title: string, content: string) => {
    modal.error({ title, content, centered: true });
  }, [modal]);

  useGlobalErrorHandling(showErrorModal);

  const {
    watchList,
    configState,
    handleAddWatchVariable,
    handleOpenVariableConfig,
    handleSubmitWatchExpression,
  } = useVariableWatch({
    defaultVariableConfig,
    initialWatchVariables: ["data"],
    isWatchExpression,
    messageApi,
  });

  const runtimeReady = useRuntimeBootstrap({ onError: showErrorModal });

  const {
    manifest,
    runVisualization,
    setManifest,
    setStatusMessage,
    status,
    statusMessage,
  } = useVisualizationRun({
    globalConfig,
    sourceCode,
    variableConfigs: configState.variableConfigs,
    watchVariables: watchList.watchVariables,
    onError: showErrorModal,
  });

  const timelineState = useTimelinePlayback(manifest);

  const manifestVariables = useMemo(() => manifest.map((entry) => entry.variable), [manifest]);
  const candidateVariables = useMemo(() => extractCandidateVariables(sourceCode), [sourceCode]);
  const activeExecutionLine = useMemo(() => {
    for (const entry of manifest) {
      const step = entry.steps.find((candidate) => candidate.timelineKey === timelineState.activeTimelineKey);
      if (step?.meta?.line_number) {
        return Number(step.meta.line_number);
      }
    }
    return null;
  }, [manifest, timelineState.activeTimelineKey]);

  const { handleEditorMount } = useEditorDecorations({
    activeExecutionLine,
    isPythonIdentifier,
    onIdentifierClick: (identifier) => {
      watchList.setSelectedVariable(identifier);
      if (watchList.selectionLocked) {
        handleAddWatchVariable(identifier);
      }
    },
    selectionEnabled: watchList.selectionLocked,
  });

  const { handleShare } = useShareState({
    defaultGlobalConfig,
    defaultSnippet,
    globalConfig,
    messageApi,
    setGlobalConfig,
    setSourceCode,
    setStatusMessage,
    setTopMenuKey: navigation.setTopMenuKey,
    setVariableConfigs: configState.setVariableConfigs,
    setVizMenuKey: navigation.setVizMenuKey,
    setWatchVariables: watchList.setWatchVariables,
    shareParam: SHARE_PARAM,
    sourceCode,
    variableConfigs: configState.variableConfigs,
    watchVariables: watchList.watchVariables,
  });

  const editorOptions = useMemo<editor.IStandaloneEditorConstructionOptions>(
    () => ({
      minimap: { enabled: false },
      fontSize: 14,
      scrollBeyondLastLine: false,
      wordWrap: "on" as const,
      automaticLayout: true,
      glyphMargin: true,
      padding: { top: 12, bottom: 12 },
    }),
    [],
  );

  const resetSelectionState = useCallback(() => {
    watchList.setSelectedVariable(null);
    watchList.setSelectionLocked(false);
  }, [watchList]);

  const libraryState = useLibraryState({
    storageKey: COLLECTIONS_STORAGE_KEY,
    defaultSnippet,
    defaultGlobalConfig,
    sourceCode,
    watchVariables: watchList.watchVariables,
    globalConfig,
    variableConfigs: configState.variableConfigs,
    manifest,
    messageApi,
    persistWatchVariables: watchList.setWatchVariables,
    persistVariableConfigs: configState.setVariableConfigs,
    persistSourceCode: setSourceCode,
    persistGlobalConfig: setGlobalConfig,
    persistManifest: setManifest,
    resetSelectionState,
    openVisualizationMain: navigation.openVisualizationMain,
  });

  const { setSaveModalOpen } = libraryState;
  const openSaveModal = useCallback(() => {
    setSaveModalOpen(true);
  }, [setSaveModalOpen]);

  const { configPageProps, libraryPageProps } = useConfigPageState({
    manifestVariables,
    variableConfigs: configState.variableConfigs,
    globalConfig,
    setGlobalConfig,
    handleOpenVariableConfig,
    libraryState,
    examples: EXAMPLE_LIBRARY,
  });

  const handleRunVisualization = useCallback(async () => {
    configState.closeConfigDrawer();
    await runVisualization();
  }, [configState, runVisualization]);

  const variablePanelConfigs = useMemo(
    () => Object.fromEntries(manifestVariables.map((name) => [name, configState.variableConfigs[name] ?? defaultVariableConfig])),
    [configState.variableConfigs, manifestVariables],
  );
  const manifestViewKindsByVariable = useMemo(
    () => Object.fromEntries(manifest.map((entry) => [entry.variable, entry.compatibleViewKinds ?? VIEW_KIND_OPTIONS])) as Record<string, typeof VIEW_KIND_OPTIONS>,
    [manifest],
  );
  const configurableVariables = useMemo(
    () => Array.from(new Set([
      ...watchList.watchVariables,
      ...configState.pendingWatchVariables,
      ...(configState.configDrawerVariable ? [configState.configDrawerVariable] : []),
    ])),
    [configState.configDrawerVariable, configState.pendingWatchVariables, watchList.watchVariables],
  );
  const activeViewKindOptions = useMemo(
    () => {
      if (!configState.configDrawerVariable) {
        return VIEW_KIND_OPTIONS;
      }
      const compatible = manifestViewKindsByVariable[configState.configDrawerVariable] ?? VIEW_KIND_OPTIONS;
      const currentView = configState.variableConfigs[configState.configDrawerVariable]?.viewKind;
      if (currentView && !compatible.includes(currentView)) {
        return [currentView, ...compatible];
      }
      return compatible;
    },
    [configState.configDrawerVariable, configState.variableConfigs, manifestViewKindsByVariable],
  );

  const handleRemoveWatchVariable = useCallback((variableName: string) => {
    watchList.removeWatchVariable(variableName);
    configState.clearPendingWatchConfig(variableName);
  }, [configState, watchList]);

  const watchUiState = useMemo(() => ({
    candidateVariables,
    selectedVariable: watchList.selectedVariable,
    selectionLocked: watchList.selectionLocked,
    setSelectedVariable: watchList.setSelectedVariable,
    setSelectionLocked: watchList.setSelectionLocked,
    watchDraft: watchList.watchDraft,
    setWatchDraft: watchList.setWatchDraft,
    watchVariables: watchList.watchVariables,
    pendingWatchVariables: configState.pendingWatchVariables,
    removeWatchVariable: handleRemoveWatchVariable,
    handleAddWatchVariable,
    handleOpenVariableConfig,
    handleSubmitWatchExpression,
  }), [
    candidateVariables,
    configState.pendingWatchVariables,
    handleAddWatchVariable,
    handleRemoveWatchVariable,
    handleOpenVariableConfig,
    handleSubmitWatchExpression,
    watchList.selectedVariable,
    watchList.selectionLocked,
    watchList.setSelectedVariable,
    watchList.setSelectionLocked,
    watchList.setWatchDraft,
    watchList.watchDraft,
    watchList.watchVariables,
  ]);

  const editorState = useMemo(() => ({
    editorOptions,
    handleEditorMount,
    runtimeReady,
    setSourceCode,
    sourceCode,
    status,
    statusMessage,
  }), [editorOptions, handleEditorMount, runtimeReady, sourceCode, status, statusMessage]);

  const pageActions = useMemo(() => ({
    runVisualization: handleRunVisualization,
  }), [handleRunVisualization]);

  const workspaceValue = useMemo(() => ({
    editorState,
    pageActions,
    timelineState,
    variableConfigs: variablePanelConfigs,
    visualState: { manifest },
    watchState: watchUiState,
  }), [editorState, manifest, pageActions, timelineState, variablePanelConfigs, watchUiState]);

  return (
    <>
      <Layout className="app-layout">
        <Header className="app-header">
          <div className="app-brand">
            <Title level={3} style={{ margin: 0, color: "#fff" }}>CodeFlow</Title>
            <Text style={{ color: "rgba(255,255,255,0.7)" }}>interactive tracing workspace</Text>
          </div>
          <Space size={8} className="app-header-nav">
            <Button type={navigation.topMenuKey !== TOP_MENU_LIBRARY ? "primary" : "default"} onClick={navigation.openVisualizationMain}>
              Visualization
            </Button>
            <Button type={navigation.topMenuKey === TOP_MENU_LIBRARY ? "primary" : "default"} onClick={navigation.openLibrary}>
              Library
            </Button>
          </Space>
        </Header>

        <Layout>
          {navigation.topMenuKey !== TOP_MENU_LIBRARY ? (
            <Sider
              width={220}
              theme="light"
              className="app-sider"
              style={{ background: "#fff" }}
            >
              <div className="app-sider-inner">
                <div className="app-sider-nav">
                  <Text className="app-sider-section-label">Workspace</Text>
                  <Menu
                    mode="inline"
                    selectedKeys={navigation.sideMenuKeys}
                    onClick={navigation.handleSideMenuClick}
                    items={[
                      { key: "main", label: "Editor + visuals" },
                      { key: "config", label: "Settings" },
                    ]}
                  />
                </div>

                <div className="app-sider-actions">
                  <Divider style={{ margin: "0 0 16px" }} />
                  <Text className="app-sider-section-label">Project</Text>
                  <div className="app-sider-secondary-actions">
                    <Button icon={<SaveOutlined />} onClick={openSaveModal} block>
                      Save collection
                    </Button>
                    <Button icon={<ShareAltOutlined />} onClick={handleShare} block>
                      Share link
                    </Button>
                  </div>
                </div>
              </div>
            </Sider>
          ) : null}

          <Content className="app-content">
            <AppErrorBoundary onError={showErrorModal}>
              <NavigationContent
                navigation={navigation}
                workspaceValue={workspaceValue}
                configPageProps={configPageProps}
                libraryPageProps={libraryPageProps}
              />
            </AppErrorBoundary>
          </Content>
        </Layout>
      </Layout>

      {modalContextHolder}
      <Suspense fallback={null}>
        <VariableConfigDrawer
          open={configState.configDrawerOpen}
          variableName={configState.configDrawerVariable}
          availableVariables={configurableVariables}
          variableConfig={configState.configDrawerVariable ? (configState.variableConfigs[configState.configDrawerVariable] ?? defaultVariableConfig) : defaultVariableConfig}
          defaultVariableConfig={defaultVariableConfig}
          viewKindOptions={activeViewKindOptions}
          pendingWatchVariables={configState.pendingWatchVariables}
          onClose={configState.closeConfigDrawer}
          onApply={configState.applyVariableConfig}
          onSelectVariable={configState.openVariableConfig}
        />
        <SaveCollectionModal
          open={libraryState.saveModalOpen}
          collectionName={libraryState.collectionName}
          setCollectionName={libraryState.setCollectionName}
          onCancel={() => setSaveModalOpen(false)}
          onOk={libraryState.handleSaveCollection}
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
