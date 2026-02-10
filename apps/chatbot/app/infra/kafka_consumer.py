import json
import logging
from kafka import KafkaConsumer
from app.core.settings import settings
from app.schemas.kafka_event import DocumentIndexEvent, DocumentIndexEventType
from app.service.vector_index_service import VectorIndexService

logger = logging.getLogger(__name__)


class DocumentIndexEventConsumer:
    def __init__(self):
        self.consumer = KafkaConsumer(
            settings.KAFKA_TOPIC,
            bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS,
            group_id=settings.KAFKA_GROUP_ID,
            value_deserializer=lambda m: json.loads(m.decode('utf-8')),
            auto_offset_reset='earliest',
            enable_auto_commit=True,
            auto_commit_interval_ms=5000
        )
        self.vector_index_service = VectorIndexService()
        logger.info("Kafka Consumer initialized")

    def consume_events(self):
        logger.info("Start consuming Kafka events...")
        for message in self.consumer:
            try:
                event_data = message.value
                event = DocumentIndexEvent.model_validate(event_data)
                logger.info(f"Received event: {event.event_id}, type: {event.type}")

                if event.type == DocumentIndexEventType.CREATE:
                    self.vector_index_service.index(event)
                elif event.type == DocumentIndexEventType.UPDATE:
                    self.vector_index_service.delete_document_index(event.company_id, event.document_id)
                    self.vector_index_service.index(event)
                elif event.type == DocumentIndexEventType.DELETE:
                    self.vector_index_service.delete_document_index(event.company_id, event.document_id)

            except Exception as e:
                logger.error(f"Error processing message: {message.value}, error: {e}")

    def close(self):
        self.consumer.close()
        logger.info("Kafka Consumer closed")

