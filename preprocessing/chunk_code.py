import os
import json

# File extensions to include
SUPPORTED_EXTENSIONS = [".py", ".java", ".js", ".html", ".css"]

def read_file(file_path):
    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read()
    except:
        return None

def chunk_text(text, chunk_size=800):
    """
    Simple chunking based on character length.
    """
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start = end
    return chunks

def chunk_codebase(repo_path, output_json_path):
    code_chunks = []
    file_count = 0

    for root, dirs, files in os.walk(repo_path):
        for file in files:
            ext = os.path.splitext(file)[1].lower()
            if ext in SUPPORTED_EXTENSIONS:
                file_path = os.path.join(root, file)
                content = read_file(file_path)

                if content and len(content.strip()) > 0:
                    file_count += 1
                    chunks = chunk_text(content, chunk_size=800)

                    for i, chunk in enumerate(chunks):
                        code_chunks.append({
                            "file_name": file,
                            "file_path": file_path,
                            "chunk_id": f"{file}_chunk_{i+1}",
                            "content": chunk
                        })

    os.makedirs(os.path.dirname(output_json_path), exist_ok=True)

    with open(output_json_path, "w", encoding="utf-8") as f:
        json.dump(code_chunks, f, indent=4)

    print("✅ Code Chunking Completed!")
    print("Files Processed:", file_count)
    print("Total Chunks Created:", len(code_chunks))
    print("Saved at:", output_json_path)


if __name__ == "__main__":
    chunk_codebase(
        repo_path=r"D:\SDLC\data\AI-Powered-Job-Matching-Tool",
        output_json_path=r"D:\SDLC\outputs\code_chunks.json"
    )
