import { createContext } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { editor } from "monaco-editor";

import type { ManifestEntry, VariableConfig } from "../../shared/types/visualization";
import type { EditorMountHandler } from "../../hooks/useEditorDecorations";
import type { TimelineFrame } from "../../lib/timeline";

export type WatchState = {
  candidateVariables: string[];
  selectedVariable: string | null;
  selectionLocked: boolean;
  setSelectedVariable: Dispatch<SetStateAction<string | null>>;
  setSelectionLocked: Dispatch<SetStateAction<boolean>>;
  watchDraft: string;
  setWatchDraft: Dispatch<SetStateAction<string>>;
  watchVariables: string[];
  pendingWatchVariables: string[];
  removeWatchVariable: (variable: string) => void;
  handleAddWatchVariable: (variable: string, options?: { openConfig?: boolean }) => void;
  handleOpenVariableConfig: (variable: string) => void;
  handleSubmitWatchExpression: () => void;
};

export type EditorState = {
  editorOptions: editor.IStandaloneEditorConstructionOptions;
  handleEditorMount: EditorMountHandler;
  runtimeReady: boolean;
  setSourceCode: Dispatch<SetStateAction<string>>;
  sourceCode: string;
  status: string;
  statusMessage: string;
};

export type TimelineState = {
  activeTimelineFrame?: TimelineFrame;
  activeTimelineIndex: number;
  activeTimelineKey: string;
  isPlaying: boolean;
  setActiveTimelineKey: Dispatch<SetStateAction<string>>;
  setIsPlaying: Dispatch<SetStateAction<boolean>>;
  stepTo: (offset: number) => void;
  timelineFrames: TimelineFrame[];
};

export type PageActions = {
  runVisualization: () => Promise<void>;
};

export type VisualizationWorkspaceValue = {
  editorState: EditorState;
  pageActions: PageActions;
  timelineState: TimelineState;
  variableConfigs: Record<string, VariableConfig>;
  visualState: { manifest: ManifestEntry[] };
  watchState: WatchState;
};

export const VisualizationWorkspaceContext = createContext<VisualizationWorkspaceValue | null>(null);
