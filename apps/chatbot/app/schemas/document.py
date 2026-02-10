from pydantic import BaseModel, Field
from typing import Optional, Union
from datetime import datetime

class DocumentBase(BaseModel):
    title: str
    content: str
    category: str
    companyId: int

class DocumentCreate(DocumentBase):
    pass

class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None

class DocumentInDB(DocumentBase):
    id: str
    createdAt: Union[str, datetime]
    updatedAt: Union[str, datetime]
