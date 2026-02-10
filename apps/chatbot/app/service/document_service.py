from typing import List, Optional
from datetime import datetime
import uuid

from app.schemas.document import DocumentCreate, DocumentUpdate, DocumentInDB
from app.infra.vector_store import VectorStore, QdrantError
import logging

logger = logging.getLogger(__name__)

def recursive_split_text(text: str, chunk_size: int = 500, chunk_overlap: int = 50) -> List[str]:
    separators = ["\n\n", "\n", " ", ""]
    
    def split_text(text: str, separator_idx: int) -> List[str]:
        if separator_idx >= len(separators):
            return [text] if text else []
            
        separator = separators[separator_idx]
        splits = text.split(separator) if separator else list(text)
        final_chunks = []
        current_chunk = []
        current_len = 0
        
        for split in splits:
            split_len = len(split) + (len(separator) if separator else 0)
            if current_len + split_len > chunk_size:
                if current_chunk:
                    joined = separator.join(current_chunk)
                    if len(joined) > chunk_size:
                        final_chunks.extend(split_text(joined, separator_idx + 1))
                    else:
                        final_chunks.append(joined)
                    
                    overlap_len = 0
                    current_chunk = []
                    current_len = 0
                current_chunk = [split]
                current_len = split_len
            else:
                current_chunk.append(split)
                current_len += split_len
                
        if current_chunk:
            joined = separator.join(current_chunk)
            if len(joined) > chunk_size:
                 final_chunks.extend(split_text(joined, separator_idx + 1))
            else:
                final_chunks.append(joined)
        return final_chunks

    return split_text(text, 0)

def chunk_content(content: str, document_id: str, company_id: int, category: str, title: str) -> List[dict]:
    text_chunks = recursive_split_text(content, chunk_size=500, chunk_overlap=50)
    result = []
    for i, chunk_text in enumerate(text_chunks):
        final_content = f"{title}\n{chunk_text}" if title else chunk_text
        result.append({
            "companyId": company_id,
            "documentId": str(document_id),
            "chunkId": f"{document_id}_chunk_{i}",
            "docTitle": title,
            "sectionTitle": title,
            "title": title,
            "content": final_content,
            "originalContent": chunk_text,
            "updatedAt": datetime.utcnow().isoformat()
        })
    return result

class DocumentService:
    def __init__(self):
        self.vector_store = VectorStore.get_instance()

    async def create_document(self, document_data: DocumentCreate) -> DocumentInDB:
        document_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        try:
            # Prepare and add document chunks to vector store
            chunks = chunk_content(
                document_data.content,
                document_id,
                document_data.companyId,
                document_data.category,
                document_data.title
            )
            for chunk in chunks:
                vector = self.vector_store.embed(chunk["content"])
                self.vector_store.add_document(
                    point_id=str(uuid.uuid4()),
                    vector=vector,
                    payload=chunk
                )
            
            return DocumentInDB(
                id=document_id,
                title=document_data.title,
                content=document_data.content,
                category=document_data.category,
                companyId=document_data.companyId,
                createdAt=now,
                updatedAt=now
            )
        except Exception as e:
            logger.error(f"Error creating document: {e}")
            raise e

    async def get_document(self, document_id: str) -> Optional[DocumentInDB]:
        try:
            # Qdrant doesn't have a direct 'get document' naturally across chunks
            # We scroll for points where documentId matches
            results = self.vector_store.client.scroll(
                collection_name=self.vector_store.collection_name,
                scroll_filter={"must": [{"key": "documentId", "match": {"value": document_id}}]},
                limit=100,
                with_payload=True
            )
            points = results[0]
            if not points:
                return None
            
            # Reconstruct document from chunks
            points.sort(key=lambda x: x.payload.get("chunkId", ""))
            first_payload = points[0].payload
            
            # Combine 'originalContent' to get full content instead of title-prepended content
            full_content = "\n".join([p.payload.get("originalContent", "") for p in points])
            
            return DocumentInDB(
                id=document_id,
                title=first_payload.get("title"),
                content=full_content,
                category=first_payload.get("category"),
                companyId=first_payload.get("companyId"),
                createdAt=first_payload.get("updatedAt"), # Simplified
                updatedAt=first_payload.get("updatedAt")
            )
        except Exception as e:
            logger.error(f"Error getting document: {e}")
            return None

    async def update_document(self, document_id: str, document_data: DocumentUpdate) -> Optional[DocumentInDB]:
        existing_doc = await self.get_document(document_id)
        if not existing_doc:
            return None

        # If content/title/category changes, we re-index
        new_content = document_data.content if document_data.content is not None else existing_doc.content
        new_title = document_data.title if document_data.title is not None else existing_doc.title
        new_category = document_data.category if document_data.category is not None else existing_doc.category
        
        try:
            # Delete old vectors
            self.vector_store.delete_points_by_document_id(document_id, existing_doc.companyId)
            
            # Add new vectors
            chunks = chunk_content(
                new_content,
                document_id,
                existing_doc.companyId,
                new_category,
                new_title
            )
            for chunk in chunks:
                vector = self.vector_store.embed(chunk["content"])
                self.vector_store.add_document(
                    point_id=str(uuid.uuid4()),
                    vector=vector,
                    payload=chunk
                )
            
            return await self.get_document(document_id)
        except Exception as e:
            logger.error(f"Error updating document: {e}")
            raise e

    async def delete_document(self, document_id: str, company_id: int) -> bool:
        try:
            self.vector_store.delete_points_by_document_id(document_id, company_id)
            return True
        except Exception as e:
            logger.error(f"Error deleting document: {e}")
            return False

    async def list_documents(self, company_id: int) -> List[DocumentInDB]:
        try:
            # Scroll to find unique document IDs
            results = self.vector_store.client.scroll(
                collection_name=self.vector_store.collection_name,
                scroll_filter={"must": [{"key": "companyId", "match": {"value": company_id}}]},
                limit=1000,
                with_payload=True
            )
            points = results[0]
            
            unique_docs = {}
            for p in points:
                doc_id = p.payload.get("documentId")
                if doc_id and doc_id not in unique_docs:
                    unique_docs[doc_id] = p.payload
            
            return [
                DocumentInDB(
                    id=did,
                    title=pload.get("title"),
                    content="", # Don't load full content for lists
                    category=pload.get("category"),
                    companyId=pload.get("companyId"),
                    createdAt=pload.get("updatedAt"),
                    updatedAt=pload.get("updatedAt")
                ) for did, pload in unique_docs.items()
            ]
        except Exception as e:
            logger.error(f"Error listing documents: {e}")
            return []
