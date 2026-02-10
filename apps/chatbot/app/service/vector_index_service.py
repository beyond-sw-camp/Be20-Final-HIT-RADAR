import uuid
from datetime import datetime
from typing import Union
from app.infra.vector_store import VectorStore


class VectorIndexService:
    def __init__(self):
        self.store = VectorStore.get_instance()

    def index(self, req):
        for c in req.chunks:
            # Match the point ID logic with DocumentService (valid UUID strings)
            point_id = str(uuid.uuid4())

            vector = self.store.embed(c.content)
            payload = {
                "companyId": req.company_id,
                "documentId": str(req.document_id),
                "chunkId": f"{req.document_id}_chunk_{c.chunk_id}",
                "docTitle": req.title if req.title else "Untitled",
                "sectionTitle": c.title if c.title else "",
                "title": req.title if req.title else "Untitled", # For backward visibility
                "content": c.content,
                "originalContent": c.content,
                "updatedAt": datetime.utcnow().isoformat()
            }
            self.store.add_document(point_id=point_id, vector=vector, payload=payload)

    def delete_document_index(self, company_id: int, document_id: Union[int, str]):
        self.store.delete_points_by_document_id(str(document_id), company_id)
