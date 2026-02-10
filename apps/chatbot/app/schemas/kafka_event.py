from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict, AliasChoices


import uuid

class DocumentIndexEventType(str, Enum):
    CREATE = "CREATE"
    UPDATE = "UPDATE"
    DELETE = "DELETE"


class VectorChunkRequest(BaseModel):
    chunk_id: int = Field(..., validation_alias=AliasChoices("chunkId", "index", "chunk_id"))
    title: Optional[str] = Field(None, validation_alias=AliasChoices("title", "section", "chunkTitle"))
    content: str


class DocumentIndexEvent(BaseModel):
    event_id: str = Field(default_factory=lambda: str(uuid.uuid4()), validation_alias=AliasChoices("eventId", "event_id"))
    company_id: int = Field(..., validation_alias=AliasChoices("companyId", "company_id"))
    document_id: int = Field(..., validation_alias=AliasChoices("documentId", "document_id"))
    title: Optional[str] = Field(None, validation_alias=AliasChoices("title", "docTitle"))
    type: DocumentIndexEventType = Field(default=DocumentIndexEventType.CREATE)
    chunks: Optional[List[VectorChunkRequest]] = None

    model_config = ConfigDict(populate_by_name=True)
