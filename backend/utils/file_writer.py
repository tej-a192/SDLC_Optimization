"""
SDLC Optimization - File Writer Utility
Helpers for writing generated files to project directories.
"""

import os
import json
from typing import Dict, Any


def write_text_file(directory: str, filename: str, content: str) -> str:
    """Write a text file to a directory, creating parents as needed."""
    os.makedirs(directory, exist_ok=True)
    filepath = os.path.join(directory, filename)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    return filepath


def write_json_file(directory: str, filename: str, data: Dict[str, Any]) -> str:
    """Write a JSON file to a directory."""
    os.makedirs(directory, exist_ok=True)
    filepath = os.path.join(directory, filename)
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, default=str)
    return filepath
