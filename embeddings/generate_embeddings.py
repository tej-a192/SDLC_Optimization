import os
import json
from sentence_transformers import SentenceTransformer

# Step 1: Load pretrained embedding model
model = SentenceTransformer("all-MiniLM-L6-v2")

# Step 2: Folder where chunks are stored
CHUNKS_FOLDER = r"D:\SDLC\outputs\srs_chunks"

# Step 3: Output file where embeddings will be saved
OUTPUT_FILE = r"D:\SDLC\outputs\srs_embeddings.json"


def generate_embeddings():
    all_data = []

    # Read all chunk files
    chunk_files = sorted(
        [f for f in os.listdir(CHUNKS_FOLDER) if f.endswith(".txt")]
    )

    for file_name in chunk_files:
        file_path = os.path.join(CHUNKS_FOLDER, file_name)

        with open(file_path, "r", encoding="utf-8") as f:
            text = f.read().strip()

        if not text:
            continue

        # Generate embedding
        embedding = model.encode(text).tolist()

        # Store chunk + embedding + metadata
        all_data.append({
            "chunk_id": file_name,
            "text": text,
            "embedding": embedding
        })

        print(f"✅ Embedded: {file_name}")

    # Save embeddings into JSON file
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(all_data, f, indent=4)

    print("\n🎉 SRS Embeddings Generated Successfully!")
    print("Saved at:", OUTPUT_FILE)


if __name__ == "__main__":
    generate_embeddings()
