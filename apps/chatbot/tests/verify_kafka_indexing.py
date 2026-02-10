import asyncio
from app.service.vector_index_service import VectorIndexService
from app.schemas.kafka_event import DocumentIndexEvent, DocumentIndexEventType, VectorChunkRequest
from app.service.chat_service import ChatService
from app.service.rule_based_route_classifier import Route

async def verify_indexing_and_search():
    index_service = VectorIndexService()
    chat_service = ChatService()
    
    # Simulate the Kafka message data from user logs
    event_data = {
        'eventId': 'e8947321-c2f3-47ef-ab96-a06e108e7a16',
        'companyId': 1,
        'documentId': 14,
        'title': '초과근무 규정',
        'type': 'UPDATE',
        'chunks': [
            {'chunkId': 1, 'title': '초과근무 규정', 'content': '초과근무란 법정 근무시간을 초과하여 근무하는 경우를 의미합니다.'},
            {'chunkId': 2, 'title': '초과근무 규정', 'content': '초과근무는 사전 승인을 받아야 인정됩니다.'},
            {'chunkId': 3, 'title': '초과근무 규정', 'content': '초과근무에 대해서는 수당 지급 또는 대체휴무가 부여될 수 있습니다.'},
            {'chunkId': 4, 'title': '초과근무 규정', 'content': '야간 및 휴일근무는 별도의 기준에 따라 관리됩니다.'}
        ]
    }
    
    print("\n--- Simulating Kafka Indexing ---")
    try:
        event = DocumentIndexEvent.model_validate(event_data)
        # Process UPDATE (Delete + Index)
        index_service.delete_document_index(event.company_id, event.document_id)
        index_service.index(event)
        print("✅ Indexing successful!")
    except Exception as e:
        print(f"❌ Indexing failed: {e}")
        return

    print("\n--- Verifying Search for '초과근무 정의' ---")
    answer = chat_service.handle(Route.DOCUMENT, "초과근무 정의", 1)
    print(f"\nResult: {answer[:100]}...")

if __name__ == "__main__":
    asyncio.run(verify_indexing_and_search())
