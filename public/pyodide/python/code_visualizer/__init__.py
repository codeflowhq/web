"""Primary public API surface for code_visualizer."""

from .api.browser_manifest import (
    build_browser_manifest,
    build_browser_manifest_payload,
    visualize_algorithm_manifest,
    visualize_algorithm_manifest_payload,
)
from .builders.visualization import visualize
from .config import VisualizerConfig, default_visualizer_config
from .tracing import (
    RenderedTraceFrame,
    StepTracerUnavailableError,
    VariableTraceEvent,
    build_traces,
    trace_algorithm,
    visualize_algorithm,
    visualize_trace,
    visualize_traces,
)
from .view_types import ViewKind

__all__ = [
    "VisualizerConfig",
    "ViewKind",
    "RenderedTraceFrame",
    "StepTracerUnavailableError",
    "VariableTraceEvent",
    "build_browser_manifest",
    "build_browser_manifest_payload",
    "visualize_algorithm_manifest",
    "visualize_algorithm_manifest_payload",
    "build_traces",
    "default_visualizer_config",
    "trace_algorithm",
    "visualize_algorithm",
    "visualize",
    "visualize_trace",
    "visualize_traces",
]
