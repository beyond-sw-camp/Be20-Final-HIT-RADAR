from qdrant_client import QdrantClient
from app.core.settings import settings

def list_all_docs():
    client = QdrantClient(host=settings.QDRANT_HOST, port=settings.QDRANT_PORT)
    collection_name = settings.QDRANT_COLLECTION
    
    print(f"--- All Documents in {collection_name} ---")
    results = client.scroll(
        collection_name=collection_name,
        limit=100,
        with_payload=True,
        with_vectors=False
    )
    
    points = results[0]
    if not points:
        print("No documents found.")
        return

    for p in points:
        payload = p.payload
        print(f"ID: {p.id}")
        print(f"  Title: {payload.get('title')}")
        print(f"  Company: {payload.get('companyId')}")
        print(f"  Chunk: {payload.get('chunkId')}")
        print(f"  Content: {payload.get('content')[:50]}...")
        print("-" * 20)

if __name__ == "__main__":
    list_all_docs()
