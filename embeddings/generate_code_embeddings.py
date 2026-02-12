import os
import json
from sentence_transformers import SentenceTransformer

# -----------------------------
# SETTINGS
# -----------------------------
REPO_FOLDER = r"D:\SDLC\data\AI-Powered-Job-Matching-Tool"   # change if your repo path differs
OUTPUT_FILE = r"D:\SDLC\outputs\code_embeddings.json"

CHUNK_SIZE = 400      # characters per chunk
MAX_FILE_SIZE = 200000  # skip files larger than 200 KB

# -----------------------------
# LOAD MODEL
# -----------------------------
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")


def chunk_text(text, chunk_size=400):
    chunks = []
    for i in range(0, len(text), chunk_size):
        chunks.append(text[i:i + chunk_size])
    return chunks


def is_code_file(filename):
    ret))


def generate_code_embeddings():
    embeddings_data = []

    if not os.path.exists(REPO_FOLDER):
        print("❌ Repo folder not found:", REPO_FOLDER)
        return

    file_count = 0
    chunk_count = 0

    for root, dirs, files in os.walk(REPO_FOLDER):
        for file in files:
            if not is_code_file(file):
                continue

            file_path = os.path.join(root, file)

            # Skip huge files
            if os.path.getsize(file_path) > MAX_FILE_SIZE:
                print(f"⚠️ Skipping large file: {file}")
                continue

            try:
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    code = f.read()

                chunks = chunk_text(code, CHUNK_SIZE)

                for idx, chunk in enumerate(chunks):
                    vector = model.encode(chunk).tolist()

                    embeddings_data.append({
                        "file": file_path,
                        "chunk_id": idx,
                        "text": chunk,
                        "embedding": vector
                    })

                    chunk_count += 1
                    print(f"✅ Embedded: {file}_chunk_{idx}")

                file_count += 1

            except Exception as e:
                print("❌ Error reading:", file_path)
                print("Reason:", str(e))

    # Save output JSON
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(embeddings_data, f, indent=4)

    print("\n🎉 CODE Embeddings Generated Successfully!")
    print("📌 Total Files Embedded:", file_count)
    print("📌 Total Chunks Embedded:", chunk_count)
    print("📌 Saved at:", OUTPUT_FILE)


if __name__ == "__main__":
    generate_code_embeddings()
