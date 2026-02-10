import asyncio
from app.service.vector_index_service import VectorIndexService
from app.schemas.kafka_event import DocumentIndexEvent, DocumentIndexEventType
from app.service.chat_service import ChatService
from app.service.rule_based_route_classifier import Route
from app.infra.vector_store import VectorStore

async def verify_full_crud():
    index_service = VectorIndexService()
    chat_service = ChatService()
    store = VectorStore.get_instance()
    
    company_id = 999
    doc_id = 888
    
    print(f"\n--- [1] CREATE: Document {doc_id} ---")
    create_event = DocumentIndexEvent.model_validate({
        "eventId": "crud-test-create",
        "companyId": company_id,
        "documentId": doc_id,
        "title": "CRUD 테스트 규정",
        "type": "CREATE",
        "chunks": [
            {"index": 1, "section": "정의", "content": "이것은 CRUD 테스트 정의입니다."},
            {"index": 2, "section": "절차", "content": "이것은 CRUD 테스트 절차입니다."}
        ]
    })
    index_service.index(create_event)
    
    # Verify Search
    ans = chat_service.handle(Route.DOCUMENT, "CRUD 테스트 정의 알려줘", company_id)
    print(f"Search Result (Create): {ans}")
    assert "정의입니다" in ans
    
    print(f"\n--- [2] UPDATE: Document {doc_id} (Change content) ---")
    update_event = DocumentIndexEvent.model_validate({
        "eventId": "crud-test-update",
        "companyId": company_id,
        "documentId": doc_id,
        "title": "CRUD 테스트 규정",
        "type": "UPDATE",
        "chunks": [
            {"index": 1, "section": "정의", "content": "내용이 업데이트된 정의입니다."}
        ]
    })
    # Update logic: delete old + index new
    index_service.delete_document_index(company_id, doc_id)
    index_service.index(update_event)
    
    # Verify Search
    ans = chat_service.handle(Route.DOCUMENT, "CRUD 테스트 정의", company_id)
    print(f"Search Result (Update): {ans}")
    assert "업데이트된" in ans
    
    # Verify old chunk (index 2) is GONE
    print("Checking if old chunk '절차' is deleted...")
    ans_old = chat_service.handle(Route.DOCUMENT, "CRUD 테스트 절차", company_id)
    print(f"Search Result (Old Chunk): {ans_old}")
    assert "찾을 수 없습니다" in ans_old or "절차입니다" not in ans_old
    
    print(f"\n--- [3] DELETE: Document {doc_id} ---")
    index_service.delete_document_index(company_id, doc_id)
    
    # Verify Search
    ans = chat_service.handle(Route.DOCUMENT, "CRUD 테스트", company_id)
    print(f"Search Result (Delete): {ans}")
    assert "찾을 수 없습니다" in ans
    
    print("\n✅ FULL CRUD FLOW VERIFIED SUCCESSFULLY!")

if __name__ == "__main__":
    asyncio.run(verify_full_crud())
