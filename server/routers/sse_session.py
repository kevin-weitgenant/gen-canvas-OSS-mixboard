"""SSE session router for creating webhook relay sessions."""

import uuid

from fastapi import APIRouter

from config import settings
from schemas.responses import SseSessionResponse
from services.sse_manager import sse_manager


router = APIRouter()


@router.post("/sse-session", response_model=SseSessionResponse)
async def create_sse_session():
    """
    Create an SSE session for receiving webhook callbacks.

    The frontend will use the returned webhookUrl when calling Kie.ai directly.
    The backend never sees the user's API key.

    Returns:
        SseSessionResponse: Contains sessionId, webhookUrl, and sseUrl
    """
    session_id = str(uuid.uuid4())
    print(f"[SSE Session] Creating session: {session_id}")

    # Create SSE connection for this session
    await sse_manager.create_connection(session_id)

    # Construct webhook URL that Kie.ai will call
    webhook_url = f"{settings.server_url}/webhook/{session_id}"
    print(f"[SSE Session] Webhook URL: {webhook_url}")

    return SseSessionResponse(
        sessionId=session_id,
        webhookUrl=webhook_url,
        sseUrl=f"/sse/{session_id}"
    )
