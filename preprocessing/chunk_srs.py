import os

def chunk_text(text, chunk_size=400, overlap=50):
    """
    Splits long text into chunks of fixed word length.
    chunk_size = number of words per chunk
    overlap = number of words to overlap between chunks
    """
    words = text.split()
    chunks = []

    start = 0
    while start < len(words):
        end = start + chunk_size
        chunk = " ".join(words[start:end])
        chunks.append(chunk)

        start = end - overlap  # move forward with overlap

    return chunks


def save_chunks(chunks, output_folder):
    os.makedirs(output_folder, exist_ok=True)

    for i, chunk in enumerate(chunks):
        file_path = os.path.join(output_folder, f"chunk_{i+1}.txt")
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(chunk)

    print(f"✅ Total chunks created: {len(chunks)}")
    print(f"📂 Saved in folder: {output_folder}")


if __name__ == "__main__":
    input_path = r"D:\SDLC\outputs\srs.txt"
    output_folder = r"D:\SDLC\outputs\srs_chunks"

    # Read SRS text
    with open(input_path, "r", encoding="utf-8") as f:
        text = f.read()

    # Create chunks
    chunks = chunk_text(text, chunk_size=400, overlap=50)

    # Save chunks
    save_chunks(chunks, output_folder)
