import logging
import sys
from datetime import datetime
from pymongo import MongoClient
from app.core.settings import settings

# Configure logging
logging.basicConfig(level=logging.DEBUG, stream=sys.stdout)
logger = logging.getLogger(__name__)

def verify_mongo():
    try:
        print(f"Connecting to MongoDB at {settings.MONGO_URI}...")
        client = MongoClient(settings.MONGO_URI)
        db = client[settings.MONGO_DB]
        chat_logs = db["chat_logs"]
        
        # Test Data
        session_id = "test_session_123"
        user_id = 12345
        text = "Hello MongoDB"
        role = "user"
        route = "DOCUMENT"

        print(f"Upserting document for session {session_id}...")
        result = chat_logs.update_one(
            {"sessionId": session_id},
            {
                "$setOnInsert": {
                    "sessionId": session_id,
                    "userId": user_id,
                    "createdAt": datetime.utcnow(),
                },
                "$push": {
                    "messages": {
                        "role": role,
                        "text": text,
                        "route": route,
                        "timestamp": datetime.utcnow(),
                    }
                },
                "$set": {"updatedAt": datetime.utcnow()},
            },
            upsert=True,
        )
        print(f"Update Result: matched={result.matched_count}, modified={result.modified_count}, upserted={result.upserted_id}")

        print("Retrieving document...")
        # Try finding with just sessionId
        doc = chat_logs.find_one({"sessionId": session_id})
        if doc:
            print(f"Found document with sessionId: {doc.get('sessionId')}")
            print(f"Messages count: {len(doc.get('messages', []))}")
            print(f"User ID from doc: {doc.get('userId')} (Type: {type(doc.get('userId'))})")
        else:
            print("Document NOT found by sessionId")

        # Try finding with sessionId AND userId
        doc_with_user = chat_logs.find_one({"sessionId": session_id, "userId": user_id})
        if doc_with_user:
            print("Found document with sessionId AND userId")
        else:
            print("Document NOT found by sessionId AND userId")

        # Clean up
        chat_logs.delete_one({"sessionId": session_id})
        print("Test document cleaned up.")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    verify_mongo()
