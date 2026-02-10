from app.infra.vector_store import VectorStore
import logging
import sys

# Configure logging to see what's happening
logging.basicConfig(level=logging.INFO, stream=sys.stdout)

def debug_search(query: str, company_id: int = 1):
    vector_store = VectorStore.get_instance()
    
    print(f"\n--- Debugging Search for: '{query}' ---")
    
    # Get raw results from Qdrant
    results = vector_store.search(query=query, company_id=company_id, limit=50)
    
    print(f"\nFound {len(results)} raw results:")
    for i, res in enumerate(results):
        payload = res['payload']
        print(f"[{i+1}] Score: {res['score']:.4f} | Title: {payload.get('title')} | Content Slice: {payload.get('content')[:50]}...")

if __name__ == "__main__":
    # Test the problematic query
    debug_search("휴게 시간 어떻게됨?")
