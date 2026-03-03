"""
SDLC Optimization - Multi-Provider LLM Service
Supports OpenAI, Google Gemini, and Ollama as selectable LLM backends.
Uses 1M context window models for handling large SRS documents.
"""

import os
from typing import Optional
from enum import Enum


class LLMProvider(str, Enum):
    """Available LLM providers."""
    OPENAI = "openai"
    GEMINI = "gemini"
    OLLAMA = "ollama"


class LLMService:
    """
    Centralized LLM service supporting multiple providers.
    All core engines use this service for text/code generation.

    Provider selection is done at project creation time via the API.
    """

    def __init__(
        self,
        provider: str = "gemini",
        api_key: Optional[str] = None,
        model: Optional[str] = None,
        ollama_url: Optional[str] = None,
    ):
        self.provider = LLMProvider(provider.lower())
        self.ollama_url = ollama_url or os.getenv("OLLAMA_URL", "http://localhost:11434")

        # Set API key and model based on provider
        if self.provider == LLMProvider.OPENAI:
            self.api_key = api_key or os.getenv("OPENAI_API_KEY", "")
            self.model = model or os.getenv("OPENAI_MODEL", "gpt-4o")
        elif self.provider == LLMProvider.GEMINI:
            self.api_key = api_key or os.getenv("GEMINI_API_KEY", "")
            self.model = model or os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
        elif self.provider == LLMProvider.OLLAMA:
            self.api_key = ""  # Ollama doesn't need an API key
            self.model = model or os.getenv("OLLAMA_MODEL", "llama3")

        self._client = None

    def _get_openai_client(self):
        """Initialize OpenAI client."""
        try:
            from openai import OpenAI
            return OpenAI(api_key=self.api_key)
        except ImportError:
            print("[LLMService] openai package not installed.")
            return None

    def _get_gemini_client(self):
        """Initialize Google Gemini client."""
        try:
            from google import genai
            client = genai.Client(api_key=self.api_key)
            return client
        except ImportError:
            print("[LLMService] google-genai package not installed.")
            return None

    def _get_ollama_client(self):
        """Initialize Ollama client (uses OpenAI-compatible API)."""
        try:
            from openai import OpenAI
            return OpenAI(
                base_url=f"{self.ollama_url}/v1",
                api_key="ollama",  # Ollama doesn't validate keys
            )
        except ImportError:
            print("[LLMService] openai package not installed (needed for Ollama compatibility).")
            return None

    def generate(self, prompt: str, system_prompt: str = "", max_tokens: int = 4000) -> str:
        """
        Generate text using the selected LLM provider.

        Args:
            prompt: The user prompt / instruction.
            system_prompt: Optional system-level instruction.
            max_tokens: Maximum tokens in the response.

        Returns:
            Generated text string.
        """
        if self.provider == LLMProvider.GEMINI:
            return self._generate_gemini(prompt, system_prompt, max_tokens)
        elif self.provider == LLMProvider.OPENAI:
            return self._generate_openai(prompt, system_prompt, max_tokens)
        elif self.provider == LLMProvider.OLLAMA:
            return self._generate_ollama(prompt, system_prompt, max_tokens)

        return "[LLMService] Unknown provider"

    def _generate_openai(self, prompt: str, system_prompt: str, max_tokens: int) -> str:
        """Generate using OpenAI API."""
        client = self._get_openai_client()
        if not client:
            return f"[OpenAI Fallback] {prompt[:200]}..."

        try:
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": prompt})

            response = client.chat.completions.create(
                model=self.model,
                messages=messages,
                max_tokens=max_tokens,
                temperature=0.7,
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"[LLMService/OpenAI] Error: {e}")
            return f"[OpenAI Error] {str(e)}"

    def _generate_gemini(self, prompt: str, system_prompt: str, max_tokens: int) -> str:
        """Generate using Google Gemini API (1M context)."""
        client = self._get_gemini_client()
        if not client:
            return f"[Gemini Fallback] {prompt[:200]}..."

        try:
            from google.genai import types

            full_prompt = f"{system_prompt}\n\n{prompt}" if system_prompt else prompt

            response = client.models.generate_content(
                model=self.model,
                contents=full_prompt,
                config=types.GenerateContentConfig(
                    max_output_tokens=max_tokens,
                    temperature=0.7,
                ),
            )
            return response.text
        except Exception as e:
            print(f"[LLMService/Gemini] Error: {e}")
            return f"[Gemini Error] {str(e)}"

    def _generate_ollama(self, prompt: str, system_prompt: str, max_tokens: int) -> str:
        """Generate using Ollama (OpenAI-compatible API)."""
        client = self._get_ollama_client()
        if not client:
            return f"[Ollama Fallback] {prompt[:200]}..."

        try:
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": prompt})

            response = client.chat.completions.create(
                model=self.model,
                messages=messages,
                max_tokens=max_tokens,
                temperature=0.7,
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"[LLMService/Ollama] Error: {e}")
            return f"[Ollama Error] {str(e)}"
