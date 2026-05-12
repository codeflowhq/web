from __future__ import annotations

from pathlib import Path
from typing import Any

from graphviz import Source  # type: ignore[import-untyped]

from ..builders.visualization import visualize
from ..config import VisualizerConfig
from ..models import Artifact, ArtifactKind

OUTPUT_DIR = Path(__file__).resolve().parent.parent / "demo_outputs"


def demo_visualize(value: Any, *, config: VisualizerConfig, **kwargs: Any) -> Artifact:
    kwargs.setdefault("config", config)
    return visualize(value, **kwargs)


def save_artifact(artifact: Artifact, stem: str, *, config: VisualizerConfig, fmt: str | None = None) -> Path:
    if artifact.kind == ArtifactKind.TEXT:
        text_path = OUTPUT_DIR / f"{stem}.txt"
        text_path.write_text(artifact.content, encoding="utf-8")
        return text_path
    if artifact.kind != ArtifactKind.GRAPHVIZ:
        raise ValueError(f"graphviz artifact expected, got: {artifact.kind}")

    OUTPUT_DIR.mkdir(exist_ok=True)
    resolved_fmt = fmt or config.ensure_output_format(fmt)
    if resolved_fmt == "dot":
        dot_path = OUTPUT_DIR / f"{stem}.dot"
        dot_path.write_text(artifact.content, encoding="utf-8")
        return dot_path

    src = Source(artifact.content)
    src.format = resolved_fmt
    rendered_path = Path(src.render(filename=stem, directory=str(OUTPUT_DIR), cleanup=True))
    return rendered_path.with_suffix(f".{resolved_fmt}")
