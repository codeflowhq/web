import { useContext } from "react";

import { VisualizationWorkspaceContext, type VisualizationWorkspaceValue } from "./VisualizationWorkspaceContext";

export const useVisualizationWorkspace = (): VisualizationWorkspaceValue => {
  const value = useContext(VisualizationWorkspaceContext);
  if (value === null) {
    throw new Error("useVisualizationWorkspace must be used inside VisualizationWorkspaceProvider.");
  }
  return value;
};
