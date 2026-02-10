import sys
from pymongo import MongoClient
from app.core.settings import settings

def inspect_session(session_id):
    print(f"Connecting to {settings.MONGO_URI}...")
    client = MongoClient(settings.MONGO_URI)
    db = client[settings.MONGO_DB]
    collection = db["chat_logs"]
    
    print(f"Searching for session: {session_id}")
    doc = collection.find_one({"sessionId": session_id})
    
    if doc:
        print("✅ Document FOUND!")
        print(f"_id: {doc.get('_id')}")
        print(f"userId: {doc.get('userId')}")
        messages = doc.get("messages", [])
        print(f"Total Messages: {len(messages)}")
        print("--- Messages Preview ---")
        for i, msg in enumerate(messages):
            role = msg.get('role')
            text = msg.get('text', '')[:50].replace('\n', ' ')
            print(f"[{i}] {role}: {text}")
    else:
        print("❌ Document NOT FOUND.")
        # Print all session IDs to see if there's a typo mismatch
        print("Listing all available session IDs (first 10):")
        for d in collection.find({}, {"sessionId": 1}).limit(10):
            print(f"- {d.get('sessionId')}")

if __name__ == "__main__":
    target_session = "ml3ua8dklggu4y149a"
    if len(sys.argv) > 1:
        target_session = sys.argv[1]
    inspect_session(target_session)
