from __future__ import annotations

from ..config import VisualizerConfig
from ..view_types import ViewKind


def set_view_override(config: VisualizerConfig, name: str, view: ViewKind) -> None:
    config.view_name_map[name] = view


def configure_demo_view_overrides(config: VisualizerConfig) -> None:
    config.view_map.clear()
    config.view_name_map.clear()
    config.recursion_depth_map.clear()
    overrides: dict[str, ViewKind] = {
        "arr": ViewKind.ARRAY_CELLS,
        "arr_bar": ViewKind.BAR,
        "linked": ViewKind.LINKED_LIST,
        "hash_table": ViewKind.HASH_TABLE,
        "metrics": ViewKind.TABLE,
        "T": ViewKind.TREE,
        "tic_tac_toe": ViewKind.TREE,
        "heap": ViewKind.HEAP_DUAL,
        "nested": ViewKind.ARRAY_CELLS,
        "tuple_block": ViewKind.ARRAY_CELLS,
        "avatar_img": ViewKind.IMAGE,
        "data": ViewKind.BAR,
        "queue_state": ViewKind.ARRAY_CELLS,
        "visited_nodes": ViewKind.ARRAY_CELLS,
        "dp_matrix": ViewKind.MATRIX,
        "graph_snapshot": ViewKind.GRAPH,
        "profile": ViewKind.TABLE,
        "matrix_demo": ViewKind.MATRIX,
        "np_values": ViewKind.ARRAY_CELLS,
        "nested_np": ViewKind.ARRAY_CELLS,
        "nested_demo": ViewKind.ARRAY_CELLS,
        "graph_demo": ViewKind.GRAPH,
        "combo": ViewKind.ARRAY_CELLS,
        "combo[0].tree": ViewKind.TREE,
        "combo[1].graph": ViewKind.GRAPH,
        "combo[2].media.trend": ViewKind.BAR,
        "shortest_path": ViewKind.TABLE,
        "shortest_path.graph": ViewKind.GRAPH,
        "shortest_path.path_tree": ViewKind.TREE,
        "shortest_path.frontier_frames": ViewKind.ARRAY_CELLS,
        "shortest_path.best_dist": ViewKind.TABLE,
    }
    for key, view in overrides.items():
        set_view_override(config, key, view)
    config.recursion_depth_map.update(
        {
            "nested": 3,
            "nested_embed": 3,
            "matrix_demo": 1,
            "tuple_block": 2,
            "profile": 2,
            "np_values": 2,
            "nested_np": 3,
            "linked": 2,
            "hash_table": 2,
            "tic_tac_toe": 2,
            "nested_demo": 2,
            "graph_demo": 2,
            "combo": 4,
            "shortest_path": 3,
        }
    )
