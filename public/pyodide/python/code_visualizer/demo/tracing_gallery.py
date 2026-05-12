# ruff: noqa: T201
from __future__ import annotations

from collections.abc import Mapping
from typing import Any

from ..config import VisualizerConfig
from ..tracing import (
    StepTracerUnavailableError,
    build_traces,
    trace_algorithm,
    visualize_trace,
)
from .io import save_artifact
from .samples import STEP_TRACER_CASES


def run_tracing_gallery(config: VisualizerConfig) -> None:
    tracer_missing = False
    for case in STEP_TRACER_CASES:
        print(f"\n=== step-tracer: {case['label']} ===")
        if tracer_missing:
            print("step-tracer is missing, skipping remaining examples")
            break
        try:
            tracer_events = trace_algorithm(
                case["snippet"],
                case["watch"],
                max_events=case.get("max_events"),
            )
        except StepTracerUnavailableError as exc:
            print(f"step-tracer is missing, skipping dynamic trace demos: {exc}")
            tracer_missing = True
            break
        traces = build_traces(tracer_events)
        _render_case_frames(traces, case, config)


def _render_case_frames(traces: Mapping[str, Any], case: Mapping[str, Any], config: VisualizerConfig) -> None:
    for target in case["watch"]:
        target_name = _watch_target_name(target)
        if not target_name:
            continue
        data_trace = traces.get(target_name)
        if data_trace is None:
            print(f"{target_name} not captured, skipping")
            continue
        trace_artifacts = visualize_trace(data_trace, config=config, max_steps=case.get("max_steps"))
        for index, artifact in enumerate(trace_artifacts, start=1):
            trace_path = save_artifact(artifact, f"{case['stem']}_{target_name}_{index}", config=config)
            print(f"{target_name} frame {index}: {trace_path}")
        if not trace_artifacts:
            print(f"{target_name} has no available frames")


def _watch_target_name(target: Any) -> str:
    if isinstance(target, str):
        return target
    if isinstance(target, Mapping):
        return str(target.get("name", "") or "")
    return getattr(target, "name", "") or ""
