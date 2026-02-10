from pymongo import MongoClient
from app.core.settings import settings

def check_mongo():
    client = MongoClient(settings.MONGO_URI)
    db = client[settings.MONGO_DB]
    docs = db["documents"]
    
    print("--- Searching for '긴급휴가' in MongoDB ---")
    match = docs.find_one({"title": {"$regex": "긴급", "$options": "i"}})
    if match:
        print(f"Found match: {match['title']}")
        print(f"ID: {match['_id']}")
        print(f"Company: {match['companyId']}")
        print(f"Content length: {len(match['content'])}")
    else:
        print("No document with '긴급' in title found in MongoDB.")
    
    # List all titles
    print("\n--- All Document Titles in MongoDB ---")
    for d in docs.find({}, {"title": 1}):
        print(f"- {d.get('title')}")

if __name__ == "__main__":
    check_mongo()
