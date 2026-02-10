import asyncio
from app.service.chat_service import ChatService
from app.service.rule_based_route_classifier import Route
import logging
import sys

logging.basicConfig(level=logging.INFO, stream=sys.stdout)

async def final_verify():
    chat = ChatService()
    
    test_cases = [
        "휴게 시간 어떻게됨?", # Problematic query from user
        "징계 종류는 어떻게 돼?", # Another one
        "긴급 휴가는?"
    ]
    
    print("\n--- Final Hybrid Search Verification ---")
    for q in test_cases:
        print(f"\n🔍 Testing: '{q}'")
        res = chat.handle(Route.DOCUMENT, q, 1)
        print(f"Result: {res[:100]}...")

if __name__ == "__main__":
    asyncio.run(final_verify())
