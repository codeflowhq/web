import { useCallback, useEffect } from "react";

const encodeShareState = (payload) => btoa(encodeURIComponent(JSON.stringify(payload)));
const decodeShareState = (raw) => JSON.parse(decodeURIComponent(atob(raw)));

export const useShareState = ({
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
  shareParam,
  sourceCode,
  variableConfigs,
  watchVariables,
}) => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shared = params.get(shareParam);
    if (!shared) {
      return;
    }
    try {
      const state = decodeShareState(shared);
      setSourceCode(state.sourceCode ?? defaultSnippet);
      setWatchVariables(state.watchVariables ?? ["data"]);
      setGlobalConfig(state.globalConfig ?? defaultGlobalConfig);
      setVariableConfigs(state.variableConfigs ?? {});
      setTopMenuKey("visualization");
      setVizMenuKey("main");
      setStatusMessage("Loaded shared state from URL.");
    } catch (error) {
      console.error(error);
    }
  }, [defaultGlobalConfig, defaultSnippet, setGlobalConfig, setSourceCode, setStatusMessage, setTopMenuKey, setVariableConfigs, setVizMenuKey, setWatchVariables, shareParam]);

  const handleShare = useCallback(async () => {
    const payload = { sourceCode, watchVariables, globalConfig, variableConfigs };
    const url = new URL(window.location.href);
    url.searchParams.set(shareParam, encodeShareState(payload));
    await navigator.clipboard.writeText(url.toString());
    messageApi.success("Share link copied.");
  }, [globalConfig, messageApi, shareParam, sourceCode, variableConfigs, watchVariables]);

  return { handleShare };
};
