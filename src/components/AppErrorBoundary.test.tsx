import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import { AppErrorBoundary } from "./AppErrorBoundary";

describe("AppErrorBoundary", () => {
  it("derives a friendly state message from an error", () => {
    expect(AppErrorBoundary.getDerivedStateFromError(new Error("TypeError: heap_dual_node view expects list input")))
      .toEqual({ message: "Heap dual view only works with list data." });
  });

  it("notifies the app-level error owner", () => {
    const onError = vi.fn();
    const boundary = new AppErrorBoundary({ children: null, onError });

    boundary.componentDidCatch(new Error("SyntaxError: invalid syntax"));

    expect(onError).toHaveBeenCalledWith("Application error", "Python syntax error. Check the code and try again.");
  });

  it("renders an inline fallback when state contains an error", () => {
    const boundary = new AppErrorBoundary({ children: <div>child</div> });
    boundary.state = { message: "Inline fallback" };

    const html = renderToStaticMarkup(boundary.render());

    expect(html).toContain("Application error");
    expect(html).toContain("Inline fallback");
  });
});
