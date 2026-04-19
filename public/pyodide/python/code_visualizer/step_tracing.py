"""Compatibility layer for tracing helpers.

This module preserves the existing public import path while the implementation
lives under ``code_visualizer.tracing``.
"""

from .tracing import (
    RenderedTraceFrame,
    StepTracerUnavailableError,
    VariableTraceEvent,
    WatchFilter,
    WatchTarget,
    _access_path_matches,
    _normalize_access_path,
    _normalize_watch_filters,
    build_traces,
    trace_algorithm,
    visualize_algorithm,
    visualize_trace,
    visualize_traces,
)

__all__ = [
    "RenderedTraceFrame",
    "StepTracerUnavailableError",
    "VariableTraceEvent",
    "WatchFilter",
    "WatchTarget",
    "_access_path_matches",
    "_normalize_access_path",
    "_normalize_watch_filters",
    "build_traces",
    "trace_algorithm",
    "visualize_algorithm",
    "visualize_trace",
    "visualize_traces",
]
