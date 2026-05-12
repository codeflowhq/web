from __future__ import annotations

from typing import Any


def build_tictactoe_tree() -> dict[str, Any]:
    x_corner = {
        "board": [["X", "", ""], ["", "", ""], ["", "", ""]],
        "children": [
            {"board": [["X", "", ""], ["", "", "O"], ["", "", ""]], "children": []},
            {"board": [["X", "", "O"], ["", "", ""], ["", "", ""]], "children": []},
        ],
    }
    x_center = {
        "board": [["", "", ""], ["", "X", ""], ["", "", ""]],
        "children": [
            {"board": [["", "", "O"], ["", "X", ""], ["", "", ""]], "children": []},
            {"board": [["", "", ""], ["", "X", ""], ["O", "", ""]], "children": []},
        ],
    }
    x_bottom = {
        "board": [["", "", ""], ["", "", ""], ["", "", "X"]],
        "children": [
            {"board": [["O", "", ""], ["", "", ""], ["", "", "X"]], "children": []},
            {"board": [["", "", ""], ["", "O", ""], ["", "", "X"]], "children": []},
        ],
    }
    return {"board": [["", "", ""], ["", "", ""], ["", "", ""]], "children": [x_corner, x_center, x_bottom]}


def build_shortest_path_usecase() -> dict[str, Any]:
    graph = {
        "nodes": [
            {"id": "A", "value": {"label": "Start", "h": 5}},
            {"id": "B", "value": {"label": "B", "h": 3}},
            {"id": "C", "value": {"label": "C", "h": 2}},
            {"id": "D", "value": {"label": "Goal", "h": 0}},
            {"id": "E", "value": {"label": "E", "h": 4}},
        ],
        "edges": [
            ("A", "B", "2"),
            ("A", "C", "4"),
            ("B", "C", "1"),
            ("B", "D", "7"),
            ("C", "D", "3"),
            ("B", "E", "2"),
            ("E", "D", "2"),
        ],
        "directed": True,
    }
    frontier_frames = [
        {"iter": 0, "frontier": [{"node": "A", "dist": 0}], "visited": []},
        {"iter": 1, "frontier": [{"node": "B", "dist": 2}, {"node": "C", "dist": 4}], "visited": ["A"], "relaxations": [{"edge": "A->B", "new": 2}, {"edge": "A->C", "new": 4}]},
        {"iter": 2, "frontier": [{"node": "C", "dist": 3}, {"node": "E", "dist": 4}, {"node": "D", "dist": 9}], "visited": ["A", "B"], "relaxations": [{"edge": "B->C", "new": 3}, {"edge": "B->E", "new": 4}, {"edge": "B->D", "new": 9}]},
        {"iter": 3, "frontier": [{"node": "E", "dist": 4}, {"node": "D", "dist": 6}], "visited": ["A", "B", "C"], "relaxations": [{"edge": "C->D", "new": 6}]},
        {"iter": 4, "frontier": [{"node": "D", "dist": 6}], "visited": ["A", "B", "C", "E"], "relaxations": [{"edge": "E->D", "new": 6}]},
        {"iter": 5, "frontier": [], "visited": ["A", "B", "C", "E", "D"], "done": True},
    ]
    dist_table = {
        "A": {"dist": 0, "prev": None},
        "B": {"dist": 2, "prev": "A"},
        "C": {"dist": 3, "prev": "B"},
        "E": {"dist": 4, "prev": "B"},
        "D": {"dist": 6, "prev": "C"},
    }
    path_tree = {"label": "A", "children": [{"label": "B (2)", "children": [{"label": "C (3)", "children": [{"label": "D (6)", "children": []}]}, {"label": "E (4)", "children": [{"label": "D (6)", "children": []}]}]}]}
    return {"graph": graph, "frontier_frames": frontier_frames, "best_dist": dist_table, "path_tree": path_tree}
