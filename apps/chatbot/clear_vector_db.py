import sys
import os

# Fix import path so we can import app modules directly
sys.path.append(os.getcwd())

from app.infra.vector_store import VectorStore
from qdrant_client.models import VectorParams, Distance

def clear_db():
    print("🔌 Connecting to Vector Store...")
    try:
        vector = VectorStore.get_instance()
    except Exception as e:
        print(f"❌ Error connecting to Vector Store: {e}")
        return

    client = vector.client
    collection_name = vector.collection

    # 1. Reset Collection (Wipe Data)
    print(f"🗑️  DELETING collection '{collection_name}'...")
    client.delete_collection(collection_name)

    print(f"🆕 Creating EMPTY collection '{collection_name}'...")
    client.create_collection(
        collection_name=collection_name,
        vectors_config=VectorParams(
            size=384,  # all-MiniLM-L6-v2
            distance=Distance.COSINE,
        ),
    )
    
    print("✅ Database CLEARED. It is now empty and ready for your own documents.")

if __name__ == "__main__":
    clear_db()
