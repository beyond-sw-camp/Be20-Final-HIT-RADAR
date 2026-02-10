import threading
from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.api.chat import router as chat_router
from app.api.index import router as index_router
from app.core.settings import settings
from app.infra.kafka_consumer import DocumentIndexEventConsumer

import logging
import sys

# Add this global logger configuration
logging.basicConfig(level=logging.INFO, stream=sys.stdout)
logger = logging.getLogger(__name__)


kafka_consumer = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    global kafka_consumer
    kafka_consumer = DocumentIndexEventConsumer()
    consumer_thread = threading.Thread(target=kafka_consumer.consume_events)
    consumer_thread.daemon = True
    consumer_thread.start()
    yield
    # Shutdown
    if kafka_consumer:
        kafka_consumer.close()


app = FastAPI(title=settings.APP_NAME, lifespan=lifespan)

app.include_router(chat_router)
app.include_router(index_router)