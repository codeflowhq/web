import { Suspense, lazy } from "react";
import { Card } from "antd";

import { TOP_MENU_LIBRARY, TOP_MENU_VISUALIZATION, VIZ_MENU_CONFIG, VIZ_MENU_MAIN } from "./navigationState";
import { VisualizationWorkspaceProvider } from "../visualization/VisualizationWorkspaceProvider";
import type { VisualizationWorkspaceValue } from "../visualization/VisualizationWorkspaceContext";
import type { ConfigPageProps, LibraryPageProps } from "../../hooks/useConfigPageState";
import type { TopMenuKey, VizMenuKey } from "../../shared/types/visualization";

const VisualizationMainPage = lazy(() => import("../../components/VisualizationMainPage"));
const VisualizationConfigPage = lazy(() => import("../../components/VisualizationConfigPage"));
const LibraryPage = lazy(() => import("../../components/LibraryPage"));

type NavigationState = {
  topMenuKey: TopMenuKey;
  vizMenuKey: VizMenuKey;
};

type NavigationContentProps = {
  navigation: NavigationState;
  workspaceValue: VisualizationWorkspaceValue;
  configPageProps: ConfigPageProps;
  libraryPageProps: LibraryPageProps;
};

export const NavigationContent = ({
  navigation,
  workspaceValue,
  configPageProps,
  libraryPageProps,
}: NavigationContentProps) => (
  <div className="page-copy">
    {navigation.topMenuKey === TOP_MENU_VISUALIZATION && navigation.vizMenuKey === VIZ_MENU_MAIN ? (
      <VisualizationWorkspaceProvider value={workspaceValue}>
        <Suspense fallback={<Card className="surface-card" loading />}>
          <VisualizationMainPage />
        </Suspense>
      </VisualizationWorkspaceProvider>
    ) : null}
    {navigation.topMenuKey === TOP_MENU_VISUALIZATION && navigation.vizMenuKey === VIZ_MENU_CONFIG ? (
      <Suspense fallback={<Card className="surface-card" loading />}>
        <VisualizationConfigPage {...configPageProps} />
      </Suspense>
    ) : null}
    {navigation.topMenuKey === TOP_MENU_LIBRARY ? (
      <Suspense fallback={<Card className="surface-card" loading />}>
        <LibraryPage {...libraryPageProps} />
      </Suspense>
    ) : null}
  </div>
);
