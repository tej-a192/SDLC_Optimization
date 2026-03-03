"""
SDLC Optimization - Embeddings Engine
Generates vector embeddings from text chunks using sentence-transformers.
"""

from typing import List
import numpy as np


class EmbeddingsEngine:
    """Generates embeddings using a sentence-transformer model."""

    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model_name = model_name
        self._model = None

    def _load_model(self):
        """Lazy-load the embedding model."""
        if self._model is None:
            try:
                from sentence_transformers import SentenceTransformer
                self._model = SentenceTransformer(self.model_name)
            except ImportError:
                print("[EmbeddingsEngine] sentence-transformers not installed, using fallback.")
                self._model = "fallback"

    def embed(self, chunks: List[str]) -> List[List[float]]:
        """
        Generate embeddings for a list of text chunks.

        Args:
            chunks: List of text strings to embed.

        Returns:
            List of embedding vectors (each a list of floats).
        """
        self._load_model()

        if self._model == "fallback":
            # Fallback: random vectors for development without GPU
            return [np.random.rand(384).tolist() for _ in chunks]

        embeddings = self._model.encode(chunks, convert_to_tensor=False)
        return embeddings.tolist() if hasattr(embeddings, "tolist") else embeddings
