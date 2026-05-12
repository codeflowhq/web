import { describe, expect, it } from "vitest";

import { buildSvgTransitionDeclaration, SVG_TRANSITION_TIMEOUT_MS } from "./svgTransitions";

describe("svgTransitions", () => {
  it("builds a stable transition declaration", () => {
    expect(buildSvgTransitionDeclaration(["opacity", "transform"]))
      .toBe("opacity 400ms ease, transform 400ms ease");
  });

  it("exports timeout including cleanup buffer", () => {
    expect(SVG_TRANSITION_TIMEOUT_MS).toBe(500);
  });
});
