from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from ..models import Artifact


@dataclass(frozen=True, slots=True)
class RenderedTraceFrame:
    """Rendered trace artifact paired with the original global execution step."""

    step: int
    artifact: Artifact
    meta: dict[str, Any] = field(default_factory=dict)


@dataclass(slots=True)
class VariableTraceEvent:
    """Single variable snapshot produced by StepTracer."""

    variable: str
    value: Any
    line_number: int
    scope_id: int
    execution_id: int
    var_id: int
    access_path: str
    order: int
    access_paths: tuple[str, ...] = ()

    def note(self) -> str:
        return f"line {self.line_number} · exec#{self.execution_id} · scope#{self.scope_id}"
