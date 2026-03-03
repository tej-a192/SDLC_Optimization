"""
SDLC Optimization - Document Processor
Handles text chunking and preprocessing of SRS documents.
"""

from typing import List


def chunk_text(text: str, chunk_size: int = 500, chunk_overlap: int = 50) -> List[str]:
    """
    Split text into overlapping chunks for embedding.

    Args:
        text: The raw SRS text to split.
        chunk_size: Max characters per chunk.
        chunk_overlap: Overlapping characters between consecutive chunks.

    Returns:
        List of text chunks.
    """
    chunks = []
    start = 0
    text_length = len(text)

    while start < text_length:
        end = min(start + chunk_size, text_length)
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        start += chunk_size - chunk_overlap

    return chunks


def preprocess_text(text: str) -> str:
    """
    Clean and normalise raw SRS text before chunking.
    """
    import re

    # Collapse multiple blank lines
    text = re.sub(r"\n{3,}", "\n\n", text)
    # Remove excessive whitespace
    text = re.sub(r"[ \t]+", " ", text)
    return text.strip()
