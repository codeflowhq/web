import { useCallback, useState } from "react";

export const useVariableWatch = ({ defaultVariableConfig, initialWatchVariables, isWatchExpression, messageApi }) => {
  const [watchDraft, setWatchDraft] = useState("");
  const [selectedVariable, setSelectedVariable] = useState(null);
  const [selectionLocked, setSelectionLocked] = useState(false);
  const [watchVariables, setWatchVariables] = useState(initialWatchVariables);
  const [variableConfigs, setVariableConfigs] = useState({});
  const [configDrawerOpen, setConfigDrawerOpen] = useState(false);
  const [configDrawerVariable, setConfigDrawerVariable] = useState(null);
  const [pendingWatchVariable, setPendingWatchVariable] = useState(null);

  const handleOpenVariableConfig = useCallback((variableName) => {
    setVariableConfigs((prev) => ({
      ...prev,
      [variableName]: prev[variableName] ?? defaultVariableConfig,
    }));
    setConfigDrawerVariable(variableName);
    setConfigDrawerOpen(true);
  }, [defaultVariableConfig]);

  const handleAddWatchVariable = useCallback(
    (variableName, options = {}) => {
      if (!isWatchExpression(variableName)) {
        return;
      }
      setSelectedVariable(variableName);
      const alreadyWatched = watchVariables.includes(variableName);
      if (options.openConfig && !alreadyWatched) {
        setVariableConfigs((prev) => ({
          ...prev,
          [variableName]: prev[variableName] ?? defaultVariableConfig,
        }));
        setPendingWatchVariable(variableName);
        setConfigDrawerVariable(variableName);
        setConfigDrawerOpen(true);
        return;
      }
      setWatchVariables((prev) => (prev.includes(variableName) ? prev : [...prev, variableName]));
      if (options.openConfig) {
        handleOpenVariableConfig(variableName);
      } else {
        messageApi.success(`Added ${variableName} to watch list.`);
      }
    },
    [defaultVariableConfig, handleOpenVariableConfig, isWatchExpression, messageApi, watchVariables],
  );

  const handleVariableConfigChange = useCallback(
    (field, value) => {
      if (!configDrawerVariable) {
        return;
      }
      setVariableConfigs((prev) => ({
        ...prev,
        [configDrawerVariable]: {
          ...defaultVariableConfig,
          ...(prev[configDrawerVariable] ?? {}),
          [field]: value,
        },
      }));
    },
    [configDrawerVariable, defaultVariableConfig],
  );

  const handleSubmitWatchExpression = useCallback(() => {
    const candidate = watchDraft.trim();
    if (!candidate) {
      return;
    }
    if (!isWatchExpression(candidate)) {
      messageApi.error("Invalid watch expression.");
      return;
    }
    handleAddWatchVariable(candidate, { openConfig: true });
    setWatchDraft("");
  }, [handleAddWatchVariable, isWatchExpression, messageApi, watchDraft]);

  const closeConfigDrawer = useCallback(() => {
    setConfigDrawerOpen(false);
    setPendingWatchVariable(null);
  }, []);

  return {
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
    setConfigDrawerOpen,
    setConfigDrawerVariable,
    setPendingWatchVariable,
    setSelectedVariable,
    setSelectionLocked,
    setVariableConfigs,
    setWatchDraft,
    setWatchVariables,
    variableConfigs,
    watchDraft,
    watchVariables,
  };
};
