from __future__ import annotations

from pathlib import Path
import json
import re
import shutil
import subprocess
import tempfile

from vendor_browser_deps import SOURCES as VENDORED_SOURCES
from vendor_browser_deps import main as vendor_browser_deps

REPO_ROOT = Path(__file__).resolve().parents[1]
LIB_ROOT = REPO_ROOT.parents[1] / "code-visualizer" / "src" / "code_visualizer"
PYODIDE_ROOT = REPO_ROOT / "public" / "pyodide"
PYODIDE_PYTHON_ROOT = PYODIDE_ROOT / "python"
PYODIDE_WHEEL_ROOT = PYODIDE_ROOT / "wheels"
RUNTIME_ROOT = PYODIDE_PYTHON_ROOT / "code_visualizer"
RUNTIME_CONFIG_PATH = PYODIDE_ROOT / "runtime-config.json"


def _sync_code_visualizer_package() -> int:
    if not LIB_ROOT.exists():
        raise SystemExit(f"Missing library source directory: {LIB_ROOT}")

    if RUNTIME_ROOT.exists():
        shutil.rmtree(RUNTIME_ROOT)
    RUNTIME_ROOT.mkdir(parents=True, exist_ok=True)

    copied = 0
    for source in sorted(LIB_ROOT.rglob("*.py")):
        relative_path = source.relative_to(LIB_ROOT)
        target = RUNTIME_ROOT / relative_path
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source, target)
        copied += 1
        print(f"synced {relative_path}")
    return copied


def _strip_browser_dependencies(pyproject_text: str) -> str:
    dependency_block = re.compile(
        r"dependencies\s*=\s*\[(?:.|\n)*?\]\n",
        flags=re.MULTILINE,
    )
    stripped = dependency_block.sub("dependencies = []\n", pyproject_text, count=1)
    if stripped == pyproject_text:
        raise SystemExit("Failed to strip dependencies from pyproject.toml for browser wheel build")
    return stripped



def _build_code_visualizer_wheel() -> str:
    PYODIDE_WHEEL_ROOT.mkdir(parents=True, exist_ok=True)
    for existing in PYODIDE_WHEEL_ROOT.glob("code_visualizer-*.whl"):
        existing.unlink()

    repo_root = LIB_ROOT.parents[1]
    with tempfile.TemporaryDirectory(prefix="code_visualizer_browser_build_") as tmp_dir:
        tmp_root = Path(tmp_dir)
        shutil.copytree(repo_root / "src", tmp_root / "src")
        shutil.copyfile(repo_root / "README.md", tmp_root / "README.md")
        pyproject_text = (repo_root / "pyproject.toml").read_text(encoding="utf-8")
        (tmp_root / "pyproject.toml").write_text(_strip_browser_dependencies(pyproject_text), encoding="utf-8")

        subprocess.run(
            [
                "uv",
                "build",
                "--wheel",
                "--out-dir",
                str(PYODIDE_WHEEL_ROOT),
            ],
            cwd=tmp_root,
            check=True,
        )
    wheels = sorted(PYODIDE_WHEEL_ROOT.glob("code_visualizer-*.whl"))
    if not wheels:
        raise SystemExit("Failed to build code_visualizer wheel")
    return wheels[-1].name


def _python_source_entries() -> list[dict[str, str]]:
    entries: list[dict[str, str]] = []

    for package_name, files in VENDORED_SOURCES.items():
        package_root = PYODIDE_PYTHON_ROOT / package_name
        init_file = package_root / "__init__.py"
        if init_file.exists():
            relative_path = init_file.relative_to(PYODIDE_PYTHON_ROOT)
            entries.append(
                {
                    "url": f"pyodide/python/{relative_path.as_posix()}",
                    "path": relative_path.as_posix(),
                }
            )
        for filename in sorted(files):
            relative_path = Path(package_name) / filename
            entries.append(
                {
                    "url": f"pyodide/python/{relative_path.as_posix()}",
                    "path": relative_path.as_posix(),
                }
            )

    entries.sort(key=lambda entry: entry["path"])
    return entries


def _update_runtime_config(wheel_name: str) -> None:
    config = json.loads(RUNTIME_CONFIG_PATH.read_text(encoding="utf-8"))
    config["pythonSources"] = _python_source_entries()
    config["wheelUrls"] = [f"pyodide/wheels/{wheel_name}"]
    RUNTIME_CONFIG_PATH.write_text(json.dumps(config, indent=2) + "\n", encoding="utf-8")
    print(f"updated {RUNTIME_CONFIG_PATH.relative_to(REPO_ROOT)}")


def main() -> None:
    copied = _sync_code_visualizer_package()
    vendor_browser_deps()
    wheel_name = _build_code_visualizer_wheel()
    _update_runtime_config(wheel_name)
    print(f"done: synced {copied} Python files to {RUNTIME_ROOT}, built {wheel_name}, and vendored browser deps")


if __name__ == "__main__":
    main()
