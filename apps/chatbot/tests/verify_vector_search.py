import logging
import sys
from app.infra.vector_store import VectorStore
from app.core.settings import settings

# Configure logging
logging.basicConfig(level=logging.INFO, stream=sys.stdout)

def verify_search():
    try:
        store = VectorStore.get_instance()
        
        # Test Query
        query = "출퇴근 관리는 어떻게해"
        company_id = 1
        
        print(f"--- Searching for: '{query}' (Company ID: {company_id}) ---")
        
        # 1. Search without threshold filtering to see raw scores
        raw_results = store.search(query=query, company_id=company_id, limit=5)
        
        print(f"Found {len(raw_results)} raw results:")
        for res in raw_results:
            score = res['score']
            content = res['payload'].get('content', '')[:50] + "..."
            title = res['payload'].get('title', 'No Title')
            print(f"[{score:.4f}] {title}: {content}")
            
        # 2. Check against current threshold
        current_threshold = settings.RELEVANCE_THRESHOLD
        print(f"\nCurrent Threshold: {current_threshold}")
        
        passed = [r for r in raw_results if r['score'] >= current_threshold]
        if passed:
            print(f"✅ {len(passed)} documents pass the threshold.")
        else:
            print(f"❌ No documents pass the threshold of {current_threshold}. This explains why the bot returns a fallback response.")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    verify_search()
