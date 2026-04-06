"""Server-Sent Events (SSE) router for real-time updates."""

from fastapi import APIRouter
from sse_starlette.sse import EventSourceResponse

from services.sse_manager import sse_manager


router = APIRouter()


@router.get("/{task_id}")
async def sse_endpoint(task_id: str):
    """
    SSE endpoint for clients to receive real-time updates.

    Client should connect with EventSource and listen for messages.
    """
    return EventSourceResponse(
        sse_manager.event_stream(task_id),
        media_type="text/event-stream"
    )
