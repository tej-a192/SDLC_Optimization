"""
SDLC Optimization - Vector Store Manager
Manages storage and retrieval of embeddings using ChromaDB or FAISS.
"""

from typing import List, Dict, Any


class VectorStoreManager:
    """Manages a lightweight in-memory vector store for the RAG pipeline."""

    def __init__(self):
        self.chunks: List[str] = []
        self.embeddings: List[List[float]] = []

    def add(self, chunks: List[str], embeddings: List[List[float]]):
        """Store chunks and their corresponding embeddings."""
        self.chunks.extend(chunks)
        self.embeddings.extend(embeddings)

    def query(self, query_embedding: List[float], top_k: int = 5) -> List[Dict[str, Any]]:
        """
        Retrieve the top-k most similar chunks to the query embedding
        using cosine similarity.

        Args:
            query_embedding: The embedding vector of the query.
            top_k: Number of results to return.

        Returns:
            List of dicts with 'chunk' and 'score'.
        """
        import numpy as np

        if not self.embeddings:
            return []

        query_vec = np.array(query_embedding)
        store_vecs = np.array(self.embeddings)

        # Cosine similarity
        dot_products = np.dot(store_vecs, query_vec)
        query_norm = np.linalg.norm(query_vec)
        store_norms = np.linalg.norm(store_vecs, axis=1)
        similarities = dot_products / (store_norms * query_norm + 1e-10)

        # Get top-k indices
        top_indices = np.argsort(similarities)[-top_k:][::-1]

        results = []
        for idx in top_indices:
            results.append({
                "chunk": self.chunks[idx],
                "score": float(similarities[idx]),
            })

        return results

    def get_all_chunks(self) -> List[str]:
        """Return all stored chunks."""
        return self.chunks
