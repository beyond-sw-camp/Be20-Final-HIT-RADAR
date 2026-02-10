import uuid
import logging
from typing import Union
from qdrant_client import QdrantClient
from qdrant_client.models import (
    VectorParams,
    Distance,
    PointStruct,
    Filter,
    FieldCondition,
    MatchValue,
)
from qdrant_client.http.exceptions import UnexpectedResponse
from sentence_transformers import SentenceTransformer
from app.core.settings import settings

logger = logging.getLogger(__name__)

class QdrantError(Exception):
    """Custom exception for Qdrant related errors."""
    pass


class VectorStore:
    _instance = None
    _initialized = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(VectorStore, cls).__new__(cls)
        return cls._instance

    def _initialize_store(self):
        if not self._initialized:
            # 로컬 embedding 모델
            self.embedder = SentenceTransformer(settings.EMBEDDING_MODEL_NAME)

            self.client = QdrantClient(
                host=settings.QDRANT_HOST,
                port=settings.QDRANT_PORT,
            )

            self.collection = settings.QDRANT_COLLECTION
            self._ensure_collection()
            self._initialized = True

    @classmethod
    def get_instance(cls):
        instance = cls()
        instance._initialize_store()
        return instance

    def _ensure_collection(self):
        collections = self.client.get_collections().collections
        if not any(c.name == self.collection for c in collections):
            self.client.create_collection(
                collection_name=self.collection,
                vectors_config=VectorParams(
                    size=settings.EMBEDDING_SIZE,
                    distance=Distance.COSINE,
                ),
            )

    def embed(self, text: str) -> list[float]:
        return self.embedder.encode(text).tolist()

    def add_document(self, point_id: Union[int, str], vector: list[float], payload: dict) -> bool:
        try:
            self.client.upsert(
                collection_name=self.collection,
                points=[
                    PointStruct(
                        id=point_id,
                        vector=vector,
                        payload=payload,
                    )
                ],
            )
            return True
        except UnexpectedResponse as e:
            logger.error(f"Qdrant UnexpectedResponse during add_document: {e}")
            raise QdrantError(f"Failed to add document to Qdrant due to unexpected response: {e}") from e
        except Exception as e:
            logger.error(f"An unexpected error occurred during add_document: {e}")
            raise QdrantError(f"Failed to add document to Qdrant: {e}") from e

    def search(self, query: str, company_id: int, limit: int = 3) -> list[dict]:
        query_vector = self.embed(query)
        try:
            hits = self.client.search(
                collection_name=self.collection,
                query_vector=query_vector,
                limit=limit,
                query_filter=Filter(
                    must=[
                        FieldCondition(
                            key="companyId",
                            match=MatchValue(value=company_id),
                        )
                    ]
                ),
            )
            return [{"payload": h.payload, "score": h.score} for h in hits]
        except UnexpectedResponse as e:
            logger.error(f"Qdrant UnexpectedResponse during search: {e}")
            raise QdrantError(f"Failed to search Qdrant due to unexpected response: {e}") from e
        except Exception as e:
            logger.error(f"An unexpected error occurred during search: {e}")
            raise QdrantError(f"Failed to search Qdrant: {e}") from e

    def delete_points_by_document_id(self, document_id: Union[int, str], company_id: int) -> bool:
        try:
            self.client.delete(
                collection_name=self.collection,
                points_selector=Filter(
                    must=[
                        FieldCondition(key="documentId", match=MatchValue(value=str(document_id))),
                        FieldCondition(key="companyId", match=MatchValue(value=company_id)),
                    ]
                ),
            )
            return True
        except UnexpectedResponse as e:
            logger.error(f"Qdrant UnexpectedResponse during delete_points_by_document_id: {e}")
            raise QdrantError(f"Failed to delete points from Qdrant due to unexpected response: {e}") from e
        except Exception as e:
            logger.error(f"An unexpected error occurred during delete_points_by_document_id: {e}")
            raise QdrantError(f"Failed to delete points from Qdrant: {e}") from e