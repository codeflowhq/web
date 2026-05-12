# ruff: noqa: T201
from __future__ import annotations

from ..config import default_visualizer_config
from .config import configure_demo_view_overrides
from .gallery import run_static_gallery
from .io import OUTPUT_DIR
from .tracing_gallery import run_tracing_gallery


def main() -> None:
    OUTPUT_DIR.mkdir(exist_ok=True)
    demo_config = default_visualizer_config()
    configure_demo_view_overrides(demo_config)
    run_static_gallery(demo_config)
    run_tracing_gallery(demo_config)


if __name__ == "__main__":
    main()
