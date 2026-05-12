from __future__ import annotations

from typing import Any, Literal

from ..models import Artifact, ArtifactKind, NodeKind, VisualGraph, VisualNode
from ..rendering.graphviz.graphviz_export import render_graphviz_node_link
from ..utils.value_formatting import format_scalar_html

DirectionLiteral = Literal["LR", "TD"]


def render_scalar_artifact(name: str, value: Any, direction: DirectionLiteral, *, show_titles: bool) -> Artifact:
    graph = VisualGraph()
    graph.add_node(
        VisualNode(
            "scalar_value",
            NodeKind.OBJECT,
            format_scalar_html(value),
            {"html_label": True, "node_attrs": {"shape": "plain"}},
        )
    )
    return Artifact(
        ArtifactKind.GRAPHVIZ,
        render_graphviz_node_link(graph, direction=direction),
        title=f"{name}: value" if show_titles else None,
    )
