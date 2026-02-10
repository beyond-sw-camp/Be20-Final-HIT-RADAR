import logging
from datetime import datetime
from app.infra.mongo import chat_logs

logger = logging.getLogger(__name__)

def append_message(session_id, user_id, role, text, route):
    try:
        logger.debug(f"Attempting to update/upsert chat log for session: {session_id}")
        print(f"DEBUG: Upserting chat log for session {session_id}...")
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
        print(f"DEBUG: MongoDB Result - Matched: {result.matched_count}, Modified: {result.modified_count}, Upserted: {result.upserted_id}")
        logger.info(f"MongoDB update_one successful. Matched: {result.matched_count}, Modified: {result.modified_count}, Upserted ID: {result.upserted_id}")

        # Verify the content after update
        updated_log = chat_logs.find_one({"sessionId": session_id})
        if updated_log:
            logger.debug(f"Verified chat log for session {session_id}. Total messages: {len(updated_log.get('messages', []))}")
            # Optionally, print the last message to confirm
            if updated_log.get('messages'):
                last_message = updated_log['messages'][-1]
                logger.debug(f"Last message in session {session_id}: Role={last_message.get('role')}, Text='{last_message.get('text')}'")
        else:
            print(f"DEBUG: Failed to retrieve just-updated log for {session_id}!!")
            logger.error(f"Failed to retrieve chat log for session {session_id} after update.")
    except Exception as e:
        print(f"DEBUG: MongoDB Error for session {session_id}: {e}")
        logger.error(f"Failed to append message to MongoDB for session {session_id}: {e}")

def get_chat_logs(session_id: str, user_id: int):
    try:
        logger.debug(f"Attempting to retrieve chat logs for session: {session_id}, user: {user_id}")
        log = chat_logs.find_one({"sessionId": session_id, "userId": user_id})
        if log:
            message_count = len(log.get('messages', []))
            logger.info(f"Retrieved chat logs for session {session_id}. Message count: {message_count}")
            if message_count > 0:
                last_message = log['messages'][-1]
                logger.debug(f"Last retrieved message: Role={last_message.get('role')}, Text='{last_message.get('text')}'")
            return log.get("messages", [])
        else:
            logger.info(f"No chat logs found for session {session_id}.")
            return []
    except Exception as e:
        logger.error(f"Failed to retrieve chat logs from MongoDB for session {session_id}: {e}")
        return []

