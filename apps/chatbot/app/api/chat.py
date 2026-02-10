from fastapi import APIRouter, Header, HTTPException, Path
from pydantic import BaseModel
from app.service.rule_based_route_classifier import Route
from app.service.chat_service import ChatService
from app.service.chat_log_service import append_message, get_chat_logs
import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat")

service = ChatService()

class ChatRequest(BaseModel):
    message: str
    sessionId: str

@router.post("")
def chat(
        req: ChatRequest,
        x_user_id: str = Header(None),
        x_company_id: str = Header(None),
):
    if not x_user_id or not x_company_id:
        raise HTTPException(status_code=401)



    # Force route to DOCUMENT to avoid intent classification
    route = Route.DOCUMENT

    append_message(req.sessionId, int(x_user_id), "user", req.message, route.value)
    answer = service.handle(
        route,
        req.message,
        int(x_company_id),
    )
    append_message(req.sessionId, int(x_user_id), "bot", answer, route.value)

    return {"answer": answer}

@router.get(
    "/{session_id}/logs",
    response_model=List[Dict[str, Any]],
    response_description="Get chat logs for a session",
)
def get_session_chat_logs(
    session_id: str = Path(..., title="The ID of the chat session"),
    x_user_id: str = Header(None),
):
    if not x_user_id:
        raise HTTPException(status_code=401)
    
    logs = get_chat_logs(session_id, int(x_user_id))
    return logs
