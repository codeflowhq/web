// @vitest-environment jsdom

import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import VariableWatchCard from "./VariableWatchCard";
import type { WatchState } from "../VisualizationWorkspaceContext";

const buildWatchState = (overrides: Partial<WatchState> = {}): WatchState => ({
  candidateVariables: ["queue", "visited"],
  selectedVariable: "queue",
  selectionLocked: true,
  setSelectedVariable: vi.fn(),
  setSelectionLocked: vi.fn(),
  watchDraft: "",
  setWatchDraft: vi.fn(),
  watchVariables: ["queue"],
  pendingWatchVariables: [],
  removeWatchVariable: vi.fn(),
  handleAddWatchVariable: vi.fn(),
  handleOpenVariableConfig: vi.fn(),
  handleSubmitWatchExpression: vi.fn(),
  ...overrides,
});

describe("VariableWatchCard", () => {
  it("selects a suggested variable on keyboard activation", () => {
    const watchState = buildWatchState();
    render(<VariableWatchCard watchState={watchState} />);

    const tag = screen.getByLabelText("Select suggested variable visited");
    fireEvent.keyDown(tag, { key: "Enter" });

    expect(watchState.setSelectedVariable).toHaveBeenCalledWith("visited");
  });

  it("adds a selected non-watched variable from the detail panel", () => {
    const watchState = buildWatchState({
      selectedVariable: "visited",
    });
    render(<VariableWatchCard watchState={watchState} />);

    fireEvent.click(screen.getByRole("button", { name: "Add to watch" }));

    expect(watchState.handleAddWatchVariable).toHaveBeenCalledWith("visited");
  });

  it("opens config for an existing watched variable from the detail panel", () => {
    const watchState = buildWatchState();
    const { container } = render(<VariableWatchCard watchState={watchState} />);

    fireEvent.click(screen.getAllByLabelText("Select watched variable queue")[0]);
    const detailPane = container.querySelector(".variables-browser-detail");
    if (!detailPane) {
      throw new Error("Expected variables detail pane");
    }
    fireEvent.click(within(detailPane as HTMLElement).getByRole("button", { name: "Configure" }));

    expect(watchState.handleOpenVariableConfig).toHaveBeenCalledWith("queue");
  });

  it("hides variable lists when picking mode is off", () => {
    const watchState = buildWatchState({
      selectionLocked: false,
    });
    const { container } = render(<VariableWatchCard watchState={watchState} />);

    expect(within(container).queryByText("Watch list")).toBeNull();
    expect(within(container).getByText(/Variable picking is hidden while you edit code/i)).toBeTruthy();
  });
});
