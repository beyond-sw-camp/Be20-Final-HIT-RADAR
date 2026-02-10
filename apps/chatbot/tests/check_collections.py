from qdrant_client import QdrantClient
from app.core.settings import settings

def check_collections():
    client = QdrantClient(host=settings.QDRANT_HOST, port=settings.QDRANT_PORT)
    collections = client.get_collections().collections
    print("--- Qdrant Collections ---")
    for c in collections:
        print(f"- {c.name}")

if __name__ == "__main__":
    check_collections()
