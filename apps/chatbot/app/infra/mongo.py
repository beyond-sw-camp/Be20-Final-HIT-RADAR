from pymongo import MongoClient
from app.core.settings import settings

client = MongoClient(settings.MONGO_URI)
db = client[settings.MONGO_DB]

chat_logs = db[settings.MONGO_CHAT_LOG_COLLECTION]
