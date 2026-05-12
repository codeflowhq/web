import { describe, expect, it } from "vitest";

import { TOP_MENU_LIBRARY, TOP_MENU_VISUALIZATION, VIZ_MENU_CONFIG, VIZ_MENU_MAIN, getSideMenuKeys } from "./navigationState";

describe("getSideMenuKeys", () => {
  it("returns no side menu selection for library", () => {
    expect(getSideMenuKeys(TOP_MENU_LIBRARY, VIZ_MENU_MAIN)).toEqual([]);
  });

  it("returns the active visualization menu key", () => {
    expect(getSideMenuKeys(TOP_MENU_VISUALIZATION, VIZ_MENU_CONFIG)).toEqual([VIZ_MENU_CONFIG]);
  });
});
