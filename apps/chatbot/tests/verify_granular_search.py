import asyncio
from app.service.vector_index_service import VectorIndexService
from app.schemas.kafka_event import DocumentIndexEvent, DocumentIndexEventType
from app.service.chat_service import ChatService
from app.service.rule_based_route_classifier import Route

async def verify_granular_search():
    index_service = VectorIndexService()
    chat_service = ChatService()
    
    # Simulate the user's granular document data
    event_data = {
        "eventId": "granular-test-1234",
        "companyId": 1,
        "documentId": 17,
        "title": "초과근무 규정",
        "type": "UPDATE",
        "chunks": [
            {
                "chunkId": 1,
                "section": "초과근무 정의",
                "content": "초과근무란 법정 근무시간을 초과하여 근무하는 경우를 의미합니다."
            },
            {
                "chunkId": 2,
                "section": "사전 승인",
                "content": "초과근무는 사전 승인을 받아야 인정됩니다."
            },
            {
                "chunkId": 3,
                "section": "보상 기준",
                "content": "초과근무에 대해서는 수당 지급 또는 대체휴무가 부여될 수 있습니다."
            },
            {
                "chunkId": 4,
                "section": "야간 및 휴일근무",
                "content": "야간 및 휴일근무는 별도의 기준에 따라 관리됩니다."
            }
        ]
    }
    
    print("\n--- Simulating Granular Indexing ---")
    try:
        event = DocumentIndexEvent.model_validate(event_data)
        index_service.delete_document_index(event.company_id, event.document_id)
        index_service.index(event)
        print("✅ Granular indexing successful!")
    except Exception as e:
        print(f"❌ Indexing failed: {e}")
        return

    print("\n--- Verifying Precision for '보상 기준' ---")
    # This should match 'sectionTitle' exactly for chunk 3
    answer = chat_service.handle(Route.DOCUMENT, "보상 기준", 1)
    print(f"\nResult: {answer}")
    
    if "수당 지급" in answer:
        print("\n✅ SUCCESS: Correct granular chunk retrieved!")
    else:
        print("\n❌ FAILURE: Ranking did not prioritize section match.")

if __name__ == "__main__":
    asyncio.run(verify_granular_search())
