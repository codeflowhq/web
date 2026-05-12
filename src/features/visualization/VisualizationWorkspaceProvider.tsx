import type { ReactNode } from "react";

import { VisualizationWorkspaceContext, type VisualizationWorkspaceValue } from "./VisualizationWorkspaceContext";

type VisualizationWorkspaceProviderProps = {
  value: VisualizationWorkspaceValue;
  children: ReactNode;
};

export const VisualizationWorkspaceProvider = ({ value, children }: VisualizationWorkspaceProviderProps) => (
  <VisualizationWorkspaceContext.Provider value={value}>
    {children}
  </VisualizationWorkspaceContext.Provider>
);
