from __future__ import annotations

from typing import Any, Literal

from ..config import VisualizerConfig, default_visualizer_config
from ..ir.extractor import VisualIRExtractor
from ..ir.options import ExtractOptions
from ..models import Artifact, ArtifactKind
from ..utils.value_shapes import _is_scalar_value
from ..view_types import ViewKind
from .scalar_artifacts import render_scalar_artifact
from .structured_artifacts import render_structured_view
from .view_resolution import determine_view, make_value_coercer, resolve_recursion_depth

DirectionLiteral = Literal["LR", "TD"]


def visualize(value: Any, *, name: str = "x", config: VisualizerConfig | None = None) -> Artifact:
    cfg = config.copy() if config is not None else default_visualizer_config()
    resolved_direction: DirectionLiteral = "TD" if cfg.graph_direction == "TB" else "LR"
    value_coercer = make_value_coercer(cfg)

    original_value = value
    coerced_value = value_coercer(value)

    def resolver(slot: str, raw: Any, coerced: Any) -> tuple[ViewKind, bool]:
        return determine_view(slot, raw, coerced, cfg)

    view, configured_view = determine_view(name, original_value, coerced_value, cfg)
    recursion_budget = resolve_recursion_depth(name, original_value, cfg)
    focus_path = cfg.focus_path_map.get(name)

    artifact, handled = render_structured_view(
        view=view,
        name=name,
        value=coerced_value,
        direction=resolved_direction,
        recursion_budget=recursion_budget,
        item_limit=cfg.max_items_per_view,
        configured_view=configured_view,
        value_coercer=value_coercer,
        view_resolver=resolver,
        focus_path=focus_path,
        show_titles=cfg.show_titles,
    )
    if artifact is not None:
        return artifact
    if handled:
        view = ViewKind.NODE_LINK

    if _is_scalar_value(coerced_value):
        return render_scalar_artifact(name, coerced_value, resolved_direction, show_titles=cfg.show_titles)

    extractor = VisualIRExtractor(
        ExtractOptions(max_depth=cfg.max_depth, max_items=cfg.max_items_per_view),
        value_coercer=value_coercer,
    )
    graph = extractor.extract(coerced_value, name=name)
    from ..rendering.graphviz.graphviz_export import render_graphviz_node_link

    return Artifact(
        ArtifactKind.GRAPHVIZ,
        render_graphviz_node_link(graph, direction=resolved_direction),
        title=f"{name}: {view.value}" if cfg.show_titles else None,
    )
