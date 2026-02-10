from app.infra.vector_store import VectorStore
from qdrant_client import QdrantClient
from app.core.settings import settings

def audit_granular_titles():
    client = QdrantClient(host=settings.QDRANT_HOST, port=settings.QDRANT_PORT)
    results = client.scroll(
        collection_name="hradar_docs",
        limit=1000,
        with_payload=True,
        with_vectors=False
    )
    
    print("\n--- Detailed Document Audit ---")
    docs = {}
    for point in results[0]:
        p = point.payload
        doc_t = p.get("docTitle", "MISSING")
        sec_t = p.get("sectionTitle", "MISSING")
        old_t = p.get("title", "MISSING")
        
        if doc_t not in docs:
            docs[doc_t] = set()
        docs[doc_t].add(sec_t)
        
    for doc_t, sections in docs.items():
        print(f"\n[Doc: {doc_t}]")
        for sec in sorted(sections):
            print(f"  - Section: {sec}")

if __name__ == "__main__":
    audit_granular_titles()
