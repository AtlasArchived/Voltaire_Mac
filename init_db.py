#!/usr/bin/env python3
"""Create cato_mind.db with core tables (used by install_mac.sh and manual setup)."""
from __future__ import annotations

import importlib.util
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT / "backend"))

spec = importlib.util.spec_from_file_location("voltaire_main", ROOT / "backend" / "main.py")
mod = importlib.util.module_from_spec(spec)
assert spec.loader
spec.loader.exec_module(mod)
mod._ensure_core_db()

from paths import get_db_path

print("Database ready:", get_db_path())
