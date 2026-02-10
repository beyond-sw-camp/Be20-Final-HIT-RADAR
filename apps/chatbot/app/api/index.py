from fastapi import APIRouter, Header, HTTPException, status, Path
from pydantic import BaseModel
from typing import List
from app.service.vector_index_service import VectorIndexService

router = APIRouter(prefix="/index")

from app.schemas.kafka_event import DocumentIndexEvent, VectorChunkRequest, DocumentIndexEventType

router = APIRouter(prefix="/index")

service = VectorIndexService()


@router.post("", status_code=status.HTTP_201_CREATED)
def index_document(
        req: DocumentIndexEvent,
):
    # (선택) 내부 호출 검증
    if req.type == DocumentIndexEventType.CREATE or req.type == DocumentIndexEventType.UPDATE:
        if req.type == DocumentIndexEventType.UPDATE:
            service.delete_document_index(req.company_id, req.document_id)
        service.index(req)
    elif req.type == DocumentIndexEventType.DELETE:
        service.delete_document_index(req.company_id, req.document_id)
    
    return {"success": True}


@router.delete(
    "/{company_id}/{document_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_description="Delete indexed document"
)
async def delete_indexed_document(
    company_id: int = Path(..., title="The ID of the company"),
    document_id: int = Path(..., title="The ID of the document to delete from the index"),
):
    """
    Delete a document and its associated embeddings from the vector store.
    """
    try:
        await service.delete_document_index(company_id, document_id)
        return {"message": "Document index deleted successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete document index: {e}",
        )
