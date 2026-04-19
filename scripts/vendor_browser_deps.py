from __future__ import annotations

from pathlib import Path
import shutil
import subprocess

REPO_ROOT = Path(__file__).resolve().parents[1]
PYODIDE_ROOT = REPO_ROOT / "public" / "pyodide" / "python"

PACKAGE_EXPORTS: dict[str, str] = {
    "step_tracer": "StepTracer",
    "query_engine": "QueryEngine",
}

SOURCES: dict[str, dict[str, str]] = {
    "step_tracer": {
        "models.py": "https://raw.githubusercontent.com/edcraft-org/step-tracer/main/src/step_tracer/models.py",
        "step_tracer_utils.py": "https://raw.githubusercontent.com/edcraft-org/step-tracer/main/src/step_tracer/step_tracer_utils.py",
        "tracer.py": "https://raw.githubusercontent.com/edcraft-org/step-tracer/main/src/step_tracer/tracer.py",
        "tracer_transformer.py": "https://raw.githubusercontent.com/edcraft-org/step-tracer/main/src/step_tracer/tracer_transformer.py",
    },
    "query_engine": {
        "core.py": "https://raw.githubusercontent.com/edcraft-org/query-engine/main/src/query_engine/core.py",
        "exceptions.py": "https://raw.githubusercontent.com/edcraft-org/query-engine/main/src/query_engine/exceptions.py",
        "pipeline_steps.py": "https://raw.githubusercontent.com/edcraft-org/query-engine/main/src/query_engine/pipeline_steps.py",
        "utils.py": "https://raw.githubusercontent.com/edcraft-org/query-engine/main/src/query_engine/utils.py",
    },
}


def _download_text(url: str) -> str:
    completed = subprocess.run(
        ["curl", "-fsSL", url],
        check=True,
        capture_output=True,
        text=True,
    )
    return completed.stdout


def _write_package_init(package_name: str, package_root: Path) -> None:
    export_name = PACKAGE_EXPORTS[package_name]
    module_name = "tracer" if package_name == "step_tracer" else "core"
    init_text = (
        f'"""Browser shim for {package_name}."""\n\n'
        f'from .{module_name} import {export_name}\n\n'
        f'__all__ = ["{export_name}"]\n'
    )
    (package_root / "__init__.py").write_text(init_text, encoding="utf-8")


def main() -> None:
    for package_name, files in SOURCES.items():
        package_root = PYODIDE_ROOT / package_name
        if package_root.exists():
            shutil.rmtree(package_root)
        package_root.mkdir(parents=True, exist_ok=True)
        _write_package_init(package_name, package_root)
        for filename, url in files.items():
            target = package_root / filename
            target.write_text(_download_text(url), encoding="utf-8")
            print(f"vendored {package_name}/{filename}")


if __name__ == "__main__":
    main()
