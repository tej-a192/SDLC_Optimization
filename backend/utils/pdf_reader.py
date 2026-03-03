"""
SDLC Optimization - PDF Reader Utility
Extracts text content from uploaded PDF files.
"""

import io


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """
    Extract all text from a PDF file provided as bytes.

    Args:
        pdf_bytes: Raw bytes of the uploaded PDF file.

    Returns:
        Extracted plain text from all pages of the PDF.
    """
    import pdfplumber

    text_parts = []
    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)

    return "\n\n".join(text_parts)
