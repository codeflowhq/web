from __future__ import annotations

from dataclasses import dataclass
from typing import Literal


@dataclass(slots=True)
class ExtractOptions:
    max_depth: int = 4
    max_items: int = 30
    include_object_attrs: bool = True
    max_str_len: int = 80
    string_style: Literal["pretty", "repr"] = "pretty"
    show_index_in_node: bool = False
    show_index_on_edge: bool = True
    dict_style: Literal["entry_node", "kv_edges"] = "entry_node"
    max_table_rows: int = 30
    max_table_cols: int = 12
