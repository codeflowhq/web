from __future__ import annotations

from typing import Any

from ..utils.detection.graph import (
    _looks_like_graph_mapping,
    _try_networkx_edges_nodes,
)
from ..utils.detection.linked import (
    _collect_linked_list_labels,
    _looks_like_hash_table,
)
from ..utils.detection.tree import (
    _tree_children,
)
from ..utils.image_sources import _detect_image_source
from ..utils.type_patterns.matching import _match_type_pattern_override
from ..view_types import ViewKind

_AUTO_VIEW_TYPE_MAP: dict[str, ViewKind] = {
    "list[list]": ViewKind.MATRIX,
    "list[tuple]": ViewKind.MATRIX,
    "tuple[list]": ViewKind.MATRIX,
    "tuple[tuple]": ViewKind.MATRIX,
    "list[number]": ViewKind.ARRAY_CELLS,
    "tuple[number]": ViewKind.ARRAY_CELLS,
    "set[number]": ViewKind.ARRAY_CELLS,
    "frozenset[number]": ViewKind.ARRAY_CELLS,
    "list[any]": ViewKind.ARRAY_CELLS,
    "tuple[any]": ViewKind.ARRAY_CELLS,
    "set[any]": ViewKind.ARRAY_CELLS,
    "frozenset[any]": ViewKind.ARRAY_CELLS,
    "dict[str, any]": ViewKind.TABLE,
    "dict[any, any]": ViewKind.TABLE,
    "dict": ViewKind.TABLE,
    "linked_list": ViewKind.LINKED_LIST,
    "tree": ViewKind.TREE,
}


def choose_view(value: Any) -> ViewKind:
    if _detect_image_source(value) is not None:
        return ViewKind.IMAGE
    if _try_networkx_edges_nodes(value) is not None or _looks_like_graph_mapping(value):
        return ViewKind.GRAPH
    if _collect_linked_list_labels(value, max_nodes=10) is not None:
        return ViewKind.LINKED_LIST
    if isinstance(value, (list, tuple)) and _looks_like_hash_table(list(value)):
        return ViewKind.HASH_TABLE
    if _tree_children(value) is not None:
        return ViewKind.TREE
    pattern_view = _match_type_pattern_override(value, _AUTO_VIEW_TYPE_MAP)
    return pattern_view if pattern_view is not None else ViewKind.NODE_LINK


def compatible_views(value: Any) -> list[ViewKind]:
    if _detect_image_source(value) is not None:
        return [ViewKind.AUTO, ViewKind.IMAGE]
    if _try_networkx_edges_nodes(value) is not None or _looks_like_graph_mapping(value):
        return [ViewKind.AUTO, ViewKind.GRAPH]
    if _collect_linked_list_labels(value, max_nodes=10) is not None:
        return [ViewKind.AUTO, ViewKind.LINKED_LIST]
    if isinstance(value, (list, tuple)) and _looks_like_hash_table(list(value)):
        return [ViewKind.AUTO, ViewKind.HASH_TABLE]
    if _tree_children(value) is not None:
        return [ViewKind.AUTO, ViewKind.TREE]
    pattern_view = _match_type_pattern_override(value, _AUTO_VIEW_TYPE_MAP)
    if pattern_view == ViewKind.MATRIX:
        return [ViewKind.AUTO, ViewKind.MATRIX]
    if pattern_view == ViewKind.ARRAY_CELLS:
        numeric = isinstance(value, (list, tuple, set, frozenset)) and all(isinstance(item, (int, float)) for item in value)
        if numeric and isinstance(value, (list, tuple)):
            return [ViewKind.AUTO, ViewKind.ARRAY_CELLS, ViewKind.BAR, ViewKind.HEAP_DUAL]
        return [ViewKind.AUTO, ViewKind.ARRAY_CELLS]
    if pattern_view == ViewKind.TABLE or isinstance(value, dict):
        return [ViewKind.AUTO, ViewKind.TABLE]
    return [ViewKind.AUTO]
