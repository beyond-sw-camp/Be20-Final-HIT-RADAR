from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # App
    APP_ENV: str = "local"
    APP_NAME: str = "HRadar Chatbot"

    # Qdrant
    QDRANT_HOST: str
    QDRANT_PORT: int
    QDRANT_COLLECTION: str
    RELEVANCE_THRESHOLD: float = 0.45

    # MongoDB
    MONGO_URI: str
    MONGO_DB: str
    MONGO_CHAT_LOG_COLLECTION: str = "chat_logs"

    # Kafka
    KAFKA_BOOTSTRAP_SERVERS: str
    KAFKA_TOPIC: str
    KAFKA_GROUP_ID: str

    # Embedding
    EMBEDDING_MODEL_NAME: str = "all-MiniLM-L6-v2"
    EMBEDDING_SIZE: int = 384

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )


settings = Settings()
