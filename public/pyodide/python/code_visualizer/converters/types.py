from __future__ import annotations

from collections.abc import Callable
from typing import Any

ConverterResult = tuple[bool, Any]
ValueConverter = Callable[[Any], ConverterResult]

__all__ = ["ConverterResult", "ValueConverter"]
