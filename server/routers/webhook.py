"""Webhook router for receiving callbacks from Nano Banana 2 API."""

from fastapi import APIRouter, Request

from services.sse_manager import sse_manager


router = APIRouter()


@router.post("/{task_id}")
async def webhook_callback(task_id: str, request: Request):
    """
    Receive webhook callbacks from Nano Banana 2 API.

    Forwards the payload to the appropriate SSE connection.
    """
    payload = await request.json()
    print(f"[Webhook] Received callback for task: {task_id}")
    print(f"[Webhook] Payload state: {payload.get('state')}")

    # Add our internal task ID to the payload
    payload["internalTaskId"] = task_id

    # Forward to SSE connection
    sent = await sse_manager.send_event(task_id, payload)
    print(f"[Webhook] Event sent to SSE: {sent}")

    if not sent:
        # SSE connection may have closed - log but return 200
        # to avoid Nano Banana 2 retry attempts
        print(f"[Webhook] Warning: SSE connection not found for task: {task_id}")

    return {"status": "received", "taskId": task_id}
