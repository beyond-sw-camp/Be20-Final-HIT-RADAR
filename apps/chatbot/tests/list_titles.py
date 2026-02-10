from app.infra.vector_store import VectorStore
from qdrant_client import QdrantClient
from app.core.settings import settings

def list_all_titles():
    client = QdrantClient(host=settings.QDRANT_HOST, port=settings.QDRANT_PORT)
    # Scroll through all points to collect unique titles
    results = client.scroll(
        collection_name="hradar_docs",
        limit=1000,
        with_payload=True,
        with_vectors=False
    )
    
    unique_titles = set()
    for point in results[0]:
        title = point.payload.get("title")
        if title:
            unique_titles.add(title)
            
    print("\n--- Unique Document Titles in Qdrant ---")
    for title in sorted(unique_titles):
        print(f"- {title}")

if __name__ == "__main__":
    list_all_titles()
