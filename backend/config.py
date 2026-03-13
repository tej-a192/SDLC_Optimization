"""
SDLC Optimization Backend - Configuration
Loads environment variables and provides app-wide settings.
Supports multiple API keys per provider for round-robin rotation.
"""

import os
from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

# Base directory paths
BASE_DIR = Path(__file__).resolve().parent
ROOT_DIR = BASE_DIR.parent
PROJECTS_DIR = ROOT_DIR / "PROJECTS"

MAX_KEYS = 9  # Maximum API keys per provider


def _load_api_keys(prefix: str) -> List[str]:
    """Load up to 9 API keys from env vars like PREFIX_1, PREFIX_2, ..., PREFIX_9."""
    keys = []
    for i in range(1, MAX_KEYS + 1):
        key = os.getenv(f"{prefix}_{i}", "").strip()
        # Skip empty or obvious placeholder values
        if key and not key.startswith("your-"):
            keys.append(key)
    # Fallback: also check the old single-key format for backward compatibility
    single_key = os.getenv(prefix, "").strip()
    if single_key and not single_key.startswith("your-") and single_key not in keys:
        keys.insert(0, single_key)
    return keys


class Settings(BaseSettings):
    """Application settings loaded from .env"""

    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = True

    # LLM Provider: "openai" | "gemini" | "groq" | "ollama"
    llm_provider: str = "groq"

    # Models
    openai_model: str = "gpt-4o"
    gemini_model: str = "gemini-2.0-flash"
    groq_model: str = "llama-3.3-70b-versatile"
    ollama_model: str = "llama3"

    # Ollama (local)
    ollama_url: str = "http://localhost:11434"

    # RAG
    embedding_model: str = "all-MiniLM-L6-v2"
    vector_store: str = "chroma"
    chunk_size: int = 500
    chunk_overlap: int = 50

    # Paths
    projects_dir: str = str(PROJECTS_DIR)

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"  # Allow extra env vars (API key pools loaded separately)


settings = Settings()

# Load API key pools (outside of pydantic to support dynamic key loading)
GEMINI_API_KEYS: List[str] = _load_api_keys("GEMINI_API_KEY")
OPENAI_API_KEYS: List[str] = _load_api_keys("OPENAI_API_KEY")
GROQ_API_KEYS: List[str] = _load_api_keys("GROQ_API_KEY")
