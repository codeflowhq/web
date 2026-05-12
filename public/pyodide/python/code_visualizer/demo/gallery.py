# ruff: noqa: T201
from __future__ import annotations

from typing import Any

try:
    import numpy as np  # type: ignore
except Exception:  # pragma: no cover - optional
    np = None  # type: ignore

from ..config import VisualizerConfig
from .io import OUTPUT_DIR, demo_visualize, save_artifact
from .samples import build_linked_list, build_tree_demo
from .usecases import build_shortest_path_usecase, build_tictactoe_tree


def run_static_gallery(config: VisualizerConfig) -> None:
    print("\n=== module layout tips ===")
    print("graph views are split into dedicated builder modules by structure type")
    print("rendering helpers are split into focused Graphviz export modules")

    _render_array_examples(config)
    linked = _render_linked_list_example(config)
    hash_table = _render_hash_table_example(config)
    graph_snapshot = _render_graph_example(config)
    _render_metrics_table(config)
    root = _render_tree_examples(config)
    _render_nested_examples(config, root, linked, hash_table, graph_snapshot)
    _render_tuple_and_scalar_examples(config)
    _render_image_and_profile_examples(config, root, graph_snapshot)
    _render_shortest_path_example(config)
    _render_numpy_examples(config)
    _render_complex_auto_example(config)


def _render_array_examples(config: VisualizerConfig) -> None:
    arr = [3, 1, 2, 4, 1, 5]
    art = demo_visualize(arr, name="arr", config=config)
    path = save_artifact(art, "arr_array", config=config)
    print("\n=== list[int] -> array strip (Visualgo style, Graphviz) ===")
    print(f"saved: {path}")


def _render_linked_list_example(config: VisualizerConfig) -> Any:
    linked = build_linked_list(
        [
            {"label": "A", "meta": [1, 2]},
            {"label": "B", "meta": {"scores": [3, {"more": [4, 5]}]}},
            {"label": "C"},
        ]
    )
    art = demo_visualize(linked, name="linked", config=config)
    path = save_artifact(art, "linked_list", config=config)
    print("\n=== linked list (nested payloads inline) ===")
    print(f"saved: {path}")
    return linked


def _render_hash_table_example(config: VisualizerConfig) -> list[Any]:
    hash_table = [
        [{"key": "aa", "payload": [1, 2]}, {"key": "ab", "payload": {"count": 3}}],
        [],
        [{"key": "ba", "payload": build_linked_list([1, {"deep": [2, 3]}, 4])}],
        [{"key": "ca", "payload": {"stats": {"min": 1, "max": 9}}}],
    ]
    art = demo_visualize(hash_table, name="hash_table", config=config)
    path = save_artifact(art, "hash_table", config=config)
    print("\n=== hash table (buckets + nested cells) ===")
    print(f"saved: {path}")
    return hash_table


def _render_graph_example(config: VisualizerConfig) -> dict[str, Any]:
    graph_snapshot = {
        "nodes": [
            {"id": "A", "value": {"name": "Alpha", "score": [1, 2]}},
            {"id": "B", "value": {"name": "Beta"}},
            "C",
        ],
        "edges": [
            {"source": "A", "target": "B", "label": "win"},
            {"source": "B", "target": "C", "label": "assist"},
            ("C", "A", "loop"),
        ],
        "directed": True,
    }
    art = demo_visualize(graph_snapshot, name="graph_demo", config=config)
    path = save_artifact(art, "graph_demo", config=config)
    print("\n=== graph mapping -> graph view with edge labels ===")
    print(f"saved: {path}")
    return graph_snapshot


def _render_metrics_table(config: VisualizerConfig) -> None:
    art = demo_visualize({"p": 0.9, "q": 1.2, "r": 0.3}, name="metrics", config=config)
    path = save_artifact(art, "metrics_table", config=config)
    print("\n=== dict -> Graphviz table ===")
    print(f"saved: {path}")


def _render_tree_examples(config: VisualizerConfig) -> Any:
    root = build_tree_demo()
    art = demo_visualize(root, name="T", config=config)
    path = save_artifact(art, "tree_rooted", config=config)
    print("\n=== tree -> tree ===")
    print(f"saved: {path}")

    ttt_root = build_tictactoe_tree()
    art = demo_visualize(ttt_root, name="tic_tac_toe", config=config)
    path = save_artifact(art, "tictactoe_tree", config=config)
    print("\n=== tic-tac-toe tree with board states ===")
    print(f"saved: {path}")
    return root


def _render_nested_examples(config: VisualizerConfig, root: object, linked: object, hash_table: object, graph_snapshot: object) -> None:
    nested = [
        {"tree": root},
        {"linked": linked},
        {"hash": hash_table},
        {"graph": graph_snapshot},
        {
            "profile": {
                "name": "Ada",
                "avatar": "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png",
                "stats": {"wins": [3, 4, 5]},
            }
        },
    ]
    art = demo_visualize(nested, name="nested_demo", config=config)
    path = save_artifact(art, "nested_array", config=config)
    print("\n=== nested list/dict (recursive cells invoking other views) ===")
    print(f"saved: {path}")

    matrix_values = [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]]
    art = demo_visualize(matrix_values, name="matrix_demo", config=config)
    path = save_artifact(art, "matrix_grid", config=config)
    print("\n=== matrix view (auto-selected via DEFAULT_VIEW_TYPE_MAP) ===")
    print(f"saved: {path}")


def _render_tuple_and_scalar_examples(config: VisualizerConfig) -> None:
    tuple_block = ([1, {"deep": [2, 3]}], [4, 5])
    art = demo_visualize(tuple_block, name="tuple_block", config=config)
    path = save_artifact(art, "tuple_as_array", config=config)
    print("\n=== tuple -> array_cells via DEFAULT_VIEW_NAME_MAP ===")
    print(f"saved: {path}")

    art = demo_visualize(True, name="value", config=config)
    path = save_artifact(art, "value", config=config)
    print(f"saved: {path}")


def _render_image_and_profile_examples(config: VisualizerConfig, root: object, graph_snapshot: object) -> str:
    avatar_src = OUTPUT_DIR / "nus.png"
    art = demo_visualize(str(avatar_src), name="avatar_img", config=config)
    path = save_artifact(art, "avatar_image", config=config)
    print("\n=== standalone image value ===")
    print(f"saved: {path}")

    avatar_value = str(avatar_src) if avatar_src.exists() else "avatar.png"
    profile_snapshot = {
        "user": {"name": "Lin", "avatar": avatar_value},
        "history": [{"scores": [91, 88, 95]}, {"notes": {"week": "2026-W06", "trend": [1, 3, 6]}}],
    }
    art = demo_visualize(profile_snapshot, name="profile", config=config)
    path = save_artifact(art, "profile_table", config=config)
    print("\n=== dict table with nested depth override & local image ===")
    print(f"saved: {path}")

    combo_payload = [
        {"tree": root},
        {"graph": graph_snapshot},
        {"media": {"avatar": avatar_value, "trend": [2.5, -1.0, 3.2, 4.1]}},
    ]
    art = demo_visualize(combo_payload, name="combo", config=config)
    path = save_artifact(art, "combo_nested", config=config, fmt="png")
    print("\n=== combo list -> nested views (tree + graph + bar + image, exported PNG) ===")
    print(f"saved: {path}")
    return avatar_value


def _render_shortest_path_example(config: VisualizerConfig) -> None:
    shortest_payload = build_shortest_path_usecase()
    art = demo_visualize(shortest_payload, name="shortest_path", config=config)
    path = save_artifact(art, "shortest_path", config=config)
    print("\n=== shortest path trace (graph + frontier frames + tree) ===")
    print(f"saved: {path}")


def _render_numpy_examples(config: VisualizerConfig) -> None:
    if np is None:
        print("\n=== numpy ndarray -> array_cells (auto) ===")
        print("(numpy not installed; skipping)")
        return

    np_values = np.array([[1, 2, 3], [4, 5, 6]])
    art = demo_visualize(np_values, name="np_values", config=config)
    path = save_artifact(art, "numpy_array", config=config)
    print("\n=== numpy ndarray -> array_cells (auto) ===")
    print(f"saved: {path}")

    nested_np = np.array([np.array([[1, 2], [3, 4]]), np.array([[5, 6], [7, 8]])], dtype=object)
    art = demo_visualize(nested_np, name="nested_np", config=config)
    path = save_artifact(art, "nested_np_array", config=config)
    print("\n=== nested numpy ndarray -> nested array cells ===")
    print(f"saved: {path}")


def _render_complex_auto_example(config: VisualizerConfig) -> None:
    complex_payload = {
        "meta": {
            "id": "exp-42",
            "owner": {"name": "Ada", "team": ("vision", {"region": "us-west"})},
        },
        "batches": [
            {"step": 1, "scores": [0.91, 0.88, {"probes": (0.83, {"final": 0.8})}]},
            {
                "step": 2,
                "scores": [
                    0.95,
                    {"ablation": [{"seed": 0, "value": 0.93}, {"seed": 1, "value": (0.92, {"note": "best"})}]},
                ],
            },
        ],
        "verdict": None,
    }
    art = demo_visualize(complex_payload, name="complex_auto", config=config)
    path = save_artifact(art, "complex_auto", config=config)
    print("\n=== complex structure -> auto (recurses down to value view) ===")
    print(f"saved: {path}")
