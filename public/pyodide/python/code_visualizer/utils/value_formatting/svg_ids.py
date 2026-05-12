from __future__ import annotations

from typing import Any


def stable_svg_id(slot_name: str, *parts: Any) -> str:
    raw = "-".join(str(part) for part in (slot_name, *parts) if part is not None)
    normalized: list[str] = []
    for ch in raw:
        if ch.isalnum() or ch in {"_", "-"}:
            normalized.append(ch)
        else:
            normalized.append("-")
    cleaned = "".join(normalized).strip("-")
    if not cleaned:
        return "cv-code-visualizer-cell"
    return f"cv-{cleaned}"
