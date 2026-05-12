import { useCallback, useMemo, useState } from "react";

import {
  TOP_MENU_LIBRARY,
  TOP_MENU_VISUALIZATION,
  VIZ_MENU_MAIN,
  getSideMenuKeys,
} from "../features/navigation/navigationState";
import type { TopMenuKey, VizMenuKey } from "../shared/types/visualization";

type MenuClickEvent = { key: string };

export const useNavigationState = () => {
  const [topMenuKey, setTopMenuKey] = useState<TopMenuKey>(TOP_MENU_VISUALIZATION);
  const [vizMenuKey, setVizMenuKey] = useState<VizMenuKey>(VIZ_MENU_MAIN);

  const sideMenuKeys = useMemo(() => getSideMenuKeys(topMenuKey, vizMenuKey), [topMenuKey, vizMenuKey]);

  const openVisualizationMain = useCallback(() => {
    setTopMenuKey(TOP_MENU_VISUALIZATION);
    setVizMenuKey(VIZ_MENU_MAIN);
  }, []);

  const openLibrary = useCallback(() => {
    setTopMenuKey(TOP_MENU_LIBRARY);
  }, []);

  const handleSideMenuClick = useCallback(({ key }: MenuClickEvent) => {
    setTopMenuKey(TOP_MENU_VISUALIZATION);
    setVizMenuKey(key as VizMenuKey);
  }, []);

  return {
    topMenuKey,
    setTopMenuKey,
    vizMenuKey,
    setVizMenuKey,
    sideMenuKeys,
    openLibrary,
    openVisualizationMain,
    handleSideMenuClick,
  };
};
