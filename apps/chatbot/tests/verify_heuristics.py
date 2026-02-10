import logging
import sys
from app.service.chat_service import ChatService
from app.api.chat import Route

# Mock LLM and VectorStore can be tricky, but we can test the handle() method logic
# by observing the logs if we enable them.

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')

def test_heuristics():
    chat = ChatService()
    
    # Test cases to simulate user queries
    test_queries = [
        "초과근무 정의가 무엇인가요?",  # Should boost Definition intent
        "재택근무 보안 준수 사항은?",  # Should boost Security content
        "징계 규정 절차가 궁금해",     # Should match "징계 규정" title
    ]
    
    print("\n🚀 Testing Heuristic Re-ranking Logic...")
    for query in test_queries:
        print(f"\n🔍 Query: {query}")
        try:
            # We don't care about the final LLM answer for this test, 
            # we just want to see the "Documents re-ranked by heuristics" log
            res = chat.handle(Route.DOCUMENT, query, company_id=1)
            print(f"✅ Result: {res[:100]}...")
        except Exception as e:
            print(f"❌ Error during test: {e}")

if __name__ == "__main__":
    test_heuristics()
