"""
SDLC Optimization - RAG Pipeline
Orchestrates the full Retrieval-Augmented Generation flow:
  1. Preprocess the SRS text
  2. Chunk the text
  3. Generate embeddings
  4. Store in vector store
  5. Provide retrieval context for downstream engines
"""

from typing import Dict, Any, List

from config import settings
from rag_service.document_processor import chunk_text, preprocess_text
from rag_service.embeddings import EmbeddingsEngine
from rag_service.vector_store import VectorStoreManager


class RAGPipeline:
    """
    Full RAG pipeline that processes an SRS document and provides
    retrieval-augmented context for the core SDLC engines.
    """

    def __init__(self):
        self.embeddings_engine = EmbeddingsEngine(model_name=settings.embedding_model)
        self.vector_store = VectorStoreManager()

    def process_document(self, srs_text: str) -> Dict[str, Any]:
        """
        Process the raw SRS text through the RAG pipeline.

        Args:
            srs_text: The raw SRS document text (from PDF or user input).

        Returns:
            A context dictionary containing chunks, embeddings metadata,
            and the vector store reference for retrieval.
        """
        # Step 1: Preprocess
        clean_text = preprocess_text(srs_text)

        # Step 2: Chunk
        chunks = chunk_text(
            clean_text,
            chunk_size=settings.chunk_size,
            chunk_overlap=settings.chunk_overlap,
        )

        # Step 3: Embed
        embeddings = self.embeddings_engine.embed(chunks)

        # Step 4: Store
        self.vector_store.add(chunks, embeddings)

        return {
            "clean_text": clean_text,
            "chunks": chunks,
            "total_chunks": len(chunks),
            "embedding_dimensions": len(embeddings[0]) if embeddings else 0,
            "vector_store": self.vector_store,
        }

    def retrieve_context(self, query: str, top_k: int = 5) -> List[str]:
        """
        Retrieve the most relevant chunks for a given query string.
        Useful for downstream engines that need focused context.
        """
        query_embedding = self.embeddings_engine.embed([query])[0]
        results = self.vector_store.query(query_embedding, top_k=top_k)
        return [r["chunk"] for r in results]
