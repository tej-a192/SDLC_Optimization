"""
SDLC Optimization - Multi-Provider LLM Service
Supports OpenAI, Google Gemini, Groq, and Ollama as selectable LLM backends.
Features round-robin API key rotation (up to 9 keys), auto-retry on rate limits,
and automatic model fallback when the primary model has no quota.
"""

import os
import re
import time
import threading
from typing import Optional, List
from enum import Enum


class LLMProvider(str, Enum):
    """Available LLM providers."""
    OPENAI = "openai"
    GEMINI = "gemini"
    GROQ = "groq"
    OLLAMA = "ollama"


# Fallback models when the primary model is rate-limited or unavailable
GEMINI_FALLBACK_MODELS = ["gemini-2.0-flash", "gemini-1.5-flash"]
OPENAI_FALLBACK_MODELS = ["gpt-4o-mini", "gpt-3.5-turbo"]
GROQ_FALLBACK_MODELS = ["llama-3.1-8b-instant", "gemma2-9b-it"]


class KeyRotator:
    """
    Thread-safe round-robin API key rotator.
    Cycles through a pool of keys: 1 → 2 → ... → 9 → 1 → ...
    """

    def __init__(self, keys: List[str]):
        self.keys = keys if keys else []
        self._index = 0
        self._lock = threading.Lock()

    def get_next_key(self) -> str:
        """Get the next key in the rotation."""
        if not self.keys:
            return ""
        with self._lock:
            key = self.keys[self._index % len(self.keys)]
            self._index += 1
            return key

    @property
    def pool_size(self) -> int:
        return len(self.keys)


class LLMService:
    """
    Centralized LLM service supporting multiple providers.

    Features:
    - Round-robin key rotation across up to 9 API keys
    - Auto-retry on 429 rate-limit errors with next key
    - Automatic model fallback (e.g., gemini-2.5-pro → gemini-2.0-flash)
    - Respects retryDelay from API error responses
    """

    MAX_RETRIES = 30       # Increased to allow waiting across multiple 1-minute token resets
    BASE_RETRY_DELAY = 3   # Minimum seconds between retries

    def __init__(
        self,
        provider: str = "groq",
        api_keys: Optional[List[str]] = None,
        model: Optional[str] = None,
        ollama_url: Optional[str] = None,
    ):
        self.provider = LLMProvider(provider.lower())
        self.ollama_url = ollama_url or os.getenv("OLLAMA_URL", "http://localhost:11434")
        self._call_count = 0
        self._call_lock = threading.Lock()
        self._model_exhausted = False  # Track if primary model has zero quota

        # Load keys from config if not provided directly
        if api_keys is None:
            from config import GEMINI_API_KEYS, OPENAI_API_KEYS, GROQ_API_KEYS
            if self.provider == LLMProvider.GEMINI:
                api_keys = GEMINI_API_KEYS
            elif self.provider == LLMProvider.OPENAI:
                api_keys = OPENAI_API_KEYS
            elif self.provider == LLMProvider.GROQ:
                api_keys = GROQ_API_KEYS
            else:
                api_keys = []

        self.key_rotator = KeyRotator(api_keys)

        # Set model
        if self.provider == LLMProvider.OPENAI:
            self.model = model or os.getenv("OPENAI_MODEL", "gpt-4o")
        elif self.provider == LLMProvider.GEMINI:
            self.model = model or os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
        elif self.provider == LLMProvider.GROQ:
            self.model = model or os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
        elif self.provider == LLMProvider.OLLAMA:
            self.model = model or os.getenv("OLLAMA_MODEL", "llama3")

        self.original_model = self.model
        print(f"[LLMService] Provider: {self.provider.value} | Model: {self.model} | Key Pool: {self.key_rotator.pool_size} keys")

    def _increment_call_count(self) -> int:
        with self._call_lock:
            self._call_count += 1
            return self._call_count

    def _parse_retry_delay(self, error_str: str) -> float:
        """Extract the retryDelay value from the API error response."""
        match = re.search(r"retryDelay['\"]?\s*:\s*['\"]?(\d+\.?\d*)s?", error_str)
        if match:
            return min(float(match.group(1)), 300.0)  # Cap at 5 mins
        # For Groq, look for "try again in Xs" pattern
        match2 = re.search(r"try again in (\d+\.?\d*)s", error_str, re.IGNORECASE)
        if match2:
            return min(float(match2.group(1)), 300.0)
        return self.BASE_RETRY_DELAY

    def _is_zero_quota(self, error_str: str) -> bool:
        """Check if the error indicates the model has zero free-tier quota (paid only)."""
        return "limit: 0" in error_str or "insufficient_quota" in error_str.lower()

    def _get_fallback_model(self) -> Optional[str]:
        """Get the next fallback model for the current provider."""
        fallbacks = []
        if self.provider == LLMProvider.GEMINI:
            fallbacks = GEMINI_FALLBACK_MODELS
        elif self.provider == LLMProvider.OPENAI:
            fallbacks = OPENAI_FALLBACK_MODELS
        elif self.provider == LLMProvider.GROQ:
            fallbacks = GROQ_FALLBACK_MODELS

        for fb in fallbacks:
            if fb != self.model:
                return fb
        return None

    def generate(self, prompt: str, system_prompt: str = "", max_tokens: int = 8000, model: Optional[str] = None) -> str:
        """
        Generate text using the selected LLM provider with key rotation and model fallback.
        Allows overriding the model via the 'model' parameter.
        """
        # Temporarily override self.model if a specific one is requested for this engine
        original_model = self.model
        if model:
            self.model = model
            
        try:
            return self._generate_internal(prompt, system_prompt, max_tokens)
        finally:
            self.model = original_model

    def _generate_internal(self, prompt: str, system_prompt: str, max_tokens: int) -> str:
        call_num = self._increment_call_count()

        # Delay logic to strictly respect API limits (e.g., Groq's 30 RPM per account)
        # If we have 9 keys but they share an account limit of 30 RPM:
        # 30 RPM = 1 request every 2.0 seconds MAX
        # To be safe and account for burst TPM limits, we use 3.5s for Groq
        if call_num > 1:
            delay = 3.5 if self.provider == LLMProvider.GROQ else 2.0
            time.sleep(delay)

        for attempt in range(1, self.MAX_RETRIES + 1):
            api_key = self.key_rotator.get_next_key()
            key_label = f"...{api_key[-4:]}" if len(api_key) > 4 else "N/A"
            print(f"[LLMService] Call #{call_num} | Attempt {attempt}/{self.MAX_RETRIES} | Model: {self.model} | Key: {key_label}")

            try:
                if self.provider == LLMProvider.GEMINI:
                    result = self._generate_gemini(prompt, system_prompt, max_tokens, api_key)
                elif self.provider == LLMProvider.OPENAI:
                    result = self._generate_openai(prompt, system_prompt, max_tokens, api_key)
                elif self.provider == LLMProvider.GROQ:
                    result = self._generate_groq(prompt, system_prompt, max_tokens, api_key)
                elif self.provider == LLMProvider.OLLAMA:
                    result = self._generate_ollama(prompt, system_prompt, max_tokens)
                else:
                    result = "[LLM Error] Unknown provider"

                print(f"[LLMService] ✓ Call #{call_num} succeeded on attempt {attempt}")
                return result

            except Exception as e:
                error_str = str(e).lower()
                is_rate_limit = any(kw in error_str for kw in ["429", "rate limit", "resource_exhausted", "quota", "too many"])

                if is_rate_limit:
                    # Check if this model has ZERO quota (paid-only model)
                    if self._is_zero_quota(str(e)) and not self._model_exhausted:
                        fallback = self._get_fallback_model()
                        if fallback:
                            print(f"[LLMService] ⚠ Model '{self.model}' has zero quota. Switching to fallback: '{fallback}'")
                            self.model = fallback
                            self._model_exhausted = True
                            continue  # Retry immediately with the new model

                    if attempt < self.MAX_RETRIES:
                        base_delay = self._parse_retry_delay(str(e))
                        
                        # Option A: Token-Aware Sleeping
                        # If Groq explicitly tells us how long to wait for the bucket to refill,
                        # we wait exactly that amount + a small 0.5s buffer.
                        if self.provider == LLMProvider.GROQ and "try again in" in str(e).lower():
                            delay = base_delay + 0.5
                        else:
                            # Exponential backoff for unknown TPM exhaustion limits
                            multiplier = 2 ** (attempt - 1)
                            delay = min(base_delay * multiplier, 60.0)
                            if self.provider == LLMProvider.GROQ and delay < 10.0:
                                delay = min(10.0 * multiplier, 120.0)

                        print(f"[LLMService] Rate limited (TPM/RPM) on key {key_label}. Waiting {delay:.1f}s, then rotating... (retry {attempt}/{self.MAX_RETRIES})")
                        time.sleep(delay)
                        continue
                    else:
                        print(f"[LLMService] ✗ All {self.MAX_RETRIES} retries exhausted for call #{call_num}")
                        return f"[LLM Error] Rate limited after {self.MAX_RETRIES} retries"
                else:
                    print(f"[LLMService] ✗ Non-rate-limit error (attempt {attempt}): {e}")
                    if attempt < self.MAX_RETRIES:
                        time.sleep(self.BASE_RETRY_DELAY)
                        continue
                    return f"[LLM Error] {str(e)}"

        return "[LLM Error] All retries exhausted"

    def _generate_gemini(self, prompt: str, system_prompt: str, max_tokens: int, api_key: str) -> str:
        """Generate using Google Gemini API."""
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=api_key)
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

    def _generate_openai(self, prompt: str, system_prompt: str, max_tokens: int, api_key: str) -> str:
        """Generate using OpenAI API."""
        from openai import OpenAI

        client = OpenAI(api_key=api_key)
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

    def _generate_groq(self, prompt: str, system_prompt: str, max_tokens: int, api_key: str) -> str:
        """Generate using Groq API (OpenAI-compatible)."""
        from groq import Groq

        client = Groq(api_key=api_key)
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        # Cap max_tokens for Groq llama models (32k max completion)
        safe_max_tokens = min(max_tokens, 32000)

        response = client.chat.completions.create(
            model=self.model,
            messages=messages,
            max_tokens=safe_max_tokens,
            temperature=0.7,
        )
        return response.choices[0].message.content

    def _generate_ollama(self, prompt: str, system_prompt: str, max_tokens: int) -> str:
        """Generate using Ollama Cloud API."""
        import os
        from ollama import Client

        api_key = os.environ.get("OLLAMA_API_KEY", "")
        
        # Initialize client with Cloud Authentication
        client = Client(
            host=self.ollama_url,
            headers={'Authorization': f'Bearer {api_key}'} if api_key else {}
        )
        
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        response = client.chat(
            model=self.model,
            messages=messages,
            # Note: The ollama python library (as of early versions) doesn't always expose max_tokens natively in chat
            # but we pass options if needed. By default, Cloud models handle it well.
            options={"temperature": 0.7, "num_predict": max_tokens}
        )
        return response['message']['content']
