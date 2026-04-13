"""Shared paths for Voltaire (DB location, etc.)."""

import os
from pathlib import Path


def get_db_path() -> str:
    """
    SQLite database path. Packaged apps set VOLTAIRE_DATA_DIR (e.g. Electron userData).
    Folder installs use the process working directory (start.sh cds to the app folder).
    """
    base = os.getenv("VOLTAIRE_DATA_DIR") or os.getenv("CATO_DATA_DIR") or os.getcwd()
    return str((Path(base).resolve() / "cato_mind.db"))
