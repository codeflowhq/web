from __future__ import annotations

from collections.abc import Callable
from typing import Any, Literal

from ..graph_view_builder import build_graph_view
from ..models import Anchor, AnchorKind, Artifact, ArtifactKind
from ..rendering.graphviz.graphviz_export import render_graphviz_node_link
from ..utils.image_sources import VisualizationImageError
from ..view_types import ViewKind
from ..views.nested import STRUCTURED_VIEW_KINDS

DirectionLiteral = Literal["LR", "TD"]
ViewResolver = Callable[[str, Any, Any], tuple[ViewKind, bool]]


def render_structured_view(
    *,
    view: ViewKind,
    name: str,
    value: Any,
    direction: DirectionLiteral,
    recursion_budget: int,
    item_limit: int,
    configured_view: bool,
    value_coercer: Callable[[Any], Any],
    view_resolver: ViewResolver,
    focus_path: str | None = None,
    show_titles: bool = True,
) -> tuple[Artifact | None, bool]:
    if view not in STRUCTURED_VIEW_KINDS:
        return None, False

    try:
        root_id, nested_graph = build_graph_view(
            value,
            name,
            view,
            recursion_budget,
            item_limit=item_limit,
            value_coercer=value_coercer,
            view_resolver=view_resolver,
            focus_path=focus_path,
            show_titles=show_titles,
        )
    except (TypeError, VisualizationImageError):
        if configured_view:
            raise
        return None, True

    anchor_meta: dict[str, Any] = {}
    if view == ViewKind.GRAPH:
        anchor_meta["connect"] = False
    nested_graph.anchors.append(Anchor(name=name, node_id=root_id, kind=AnchorKind.VAR, meta=anchor_meta))
    graph_direction: DirectionLiteral = "TD" if view in {ViewKind.TREE, ViewKind.HASH_TABLE} else direction
    graph_dot = render_graphviz_node_link(nested_graph, direction=graph_direction)
    artifact_title = f"{name}: {view.value}" if show_titles else None
    return Artifact(ArtifactKind.GRAPHVIZ, graph_dot, title=artifact_title), True
