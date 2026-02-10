import asyncio
import uuid
from app.service.document_service import DocumentService
from app.schemas.document import DocumentCreate
from app.infra.mongo import db
from qdrant_client import QdrantClient
from app.core.settings import settings

async def verify_refactor():
    service = DocumentService()
    company_id = 999
    
    # 1. Create a document
    doc_data = DocumentCreate(
        title="Refactor Test Doc",
        content="This is a test document to verify Qdrant-only storage.",
        category="Test",
        companyId=company_id
    )
    print(f"Creating document...")
    created_doc = await service.create_document(doc_data)
    doc_id = created_doc.id
    print(f"Created Document ID: {doc_id}")
    
    # 2. Check MongoDB (Should be empty of this document)
    # Since we removed the 'documents' collection reference from mongo.py, we check the DB directly
    mongo_docs = db["documents"].find_one({"_id": doc_id})
    if mongo_docs:
        print("❌ FAILED: Document found in MongoDB!")
    else:
        print("✅ SUCCESS: Document not in MongoDB.")
        
    # 3. Check Qdrant
    q_client = QdrantClient(host=settings.QDRANT_HOST, port=settings.QDRANT_PORT)
    results = q_client.scroll(
        collection_name=settings.QDRANT_COLLECTION,
        scroll_filter={"must": [{"key": "documentId", "match": {"value": doc_id}}]},
        limit=1
    )
    if results[0]:
        print("✅ SUCCESS: Document found in Qdrant.")
        payload = results[0][0].payload
        print(f"   Payload Title: {payload.get('title')}")
    else:
        print("❌ FAILED: Document not found in Qdrant!")
        
    # 4. Cleanup
    print("Cleaning up...")
    await service.delete_document(doc_id, company_id)
    print("Verification complete.")

if __name__ == "__main__":
    asyncio.run(verify_refactor())
