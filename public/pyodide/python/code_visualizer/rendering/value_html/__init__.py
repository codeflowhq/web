from __future__ import annotations

from typing import Any

from .bar_chart import bar_chart_html as _bar_chart_html
from .contracts import NestedRenderer
from .formatter import format_nested_value as _format_nested_value
from .formatter import format_value_label as _format_value_label
from .matrix_table import matrix_html


def _format_matrix_html(
    rows: list[list[Any]],
    depth_remaining: int,
    max_items: int,
    *,
    include_headers: bool = False,
    row_limit: int | None = None,
    col_limit: int | None = None,
    nested_renderer: NestedRenderer | None = None,
    slot_name: str = "matrix",
) -> str:
    return matrix_html(
        rows,
        depth_remaining,
        max_items,
        include_headers=include_headers,
        row_limit=row_limit,
        col_limit=col_limit,
        nested_renderer=nested_renderer,
        slot_name=slot_name,
        format_nested_value=_format_nested_value,
    )


__all__ = [
    "NestedRenderer",
    "_bar_chart_html",
    "_format_matrix_html",
    "_format_nested_value",
    "_format_value_label",
]
