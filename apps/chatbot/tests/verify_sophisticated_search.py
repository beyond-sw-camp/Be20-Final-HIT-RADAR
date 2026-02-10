import asyncio
from app.service.vector_index_service import VectorIndexService
from app.schemas.kafka_event import DocumentIndexEvent
from app.service.chat_service import ChatService
from app.service.rule_based_route_classifier import Route
import json

async def verify_sophisticated_system():
    index_service = VectorIndexService()
    chat_service = ChatService()
    
    # 1. Test Flexible Indexing (Using 'index' and 'section' alias)
    # This matches the user's provided JSON structure
    event_data = {
        "eventId": "sophisticated-test-01",
        "companyId": 1,
        "documentId": 17,
        "title": "초과근무 규정",
        "type": "UPDATE",
        "chunks": [
            {
                "index": 1,
                "section": "초과근무 정의",
                "content": "초과근무란 법정 근무시간을 초과하여 근무하는 경우를 의미합니다."
            },
            {
                "index": 3,
                "section": "보상 기준",
                "content": "초과근무에 대해서는 수당 지급 또는 대체휴무가 부여될 수 있습니다."
            }
        ]
    }
    
    print("\n--- Testing Flexible Indexing (index/section aliases) ---")
    try:
        # Pydantic should handle the aliases correctly now
        event = DocumentIndexEvent.model_validate(event_data)
        index_service.delete_document_index(event.company_id, event.document_id)
        index_service.index(event)
        print("✅ Flexible indexing successful!")
    except Exception as e:
        print(f"❌ Indexing failed: {e}")
        return

    # 2. Test Mandatory Keyword Match (Successful case)
    print("\n--- Testing Search '초과근무 보상기준' (Should Match) ---")
    answer = chat_service.handle(Route.DOCUMENT, "초과근무 보상기준", 1)
    print(f"Result: {answer[:60]}...")
    if "수당 지급" in answer:
        print("✅ Match Success!")
    else:
        print("❌ Match Failed!")

    # 3. Test Mandatory Keyword Match (Fallback Blocking)
    # If we ask for something totally unrelated that might have high semantic score
    # but NO salient keyword match in titles.
    print("\n--- Testing Search '징계 종류' (Should be blocked if Overtime is best semantic but no keyword match) ---")
    # We expect '징계 규정' to be found if it exists, but if we delete '징계 규정' 
    # then it should return 'not found' rather than falling back to '초과근무'.
    
    # Let's ensure '징계 규정' is NOT matching for a query about '우주 여행' (Space Travel)
    print("\n--- Testing Search '우주 여행 방법' (Should be blocked by Mandatory Keyword Check) ---")
    answer = chat_service.handle(Route.DOCUMENT, "우주 여행 방법", 1)
    print(f"Result: {answer}")
    if "회사 제도 및 규정에서 찾을 수 없습니다" in answer:
        print("✅ Blocking Success (Prevented off-topic fallback)!")
    else:
        print("❌ Blocking Failed (Bot hallucinated or fell back improperly)!")

if __name__ == "__main__":
    asyncio.run(verify_sophisticated_system())
