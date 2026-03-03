"""
SDLC Optimization Backend - Configuration
Loads environment variables and provides app-wide settings.
"""

import os
from pathlib import Path
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

# Base directory paths
BASE_DIR = Path(__file__).resolve().parent
ROOT_DIR = BASE_DIR.parent
PROJECTS_DIR = ROOT_DIR / "PROJECTS"


class Settings(BaseSettings):
    """Application settings loaded from .env"""

    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = True

    # LLM Provider: "openai" | "gemini" | "ollama"
    llm_provider: str = "gemini"

    # OpenAI
    openai_api_key: str = ""
    openai_model: str = "gpt-4o"

    # Google Gemini (1M context)
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.0-flash"

    # Ollama (local)
    ollama_url: str = "http://localhost:11434"
    ollama_model: str = "llama3"

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


settings = Settings()
