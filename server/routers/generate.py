"""Image generation router for handling create task requests."""

import uuid

from fastapi import APIRouter, HTTPException

from config import settings
from schemas.requests import GenerateRequest
from schemas.responses import GenerateResponse
from services.sse_manager import sse_manager
from services.z_image import create_z_image_task


router = APIRouter()


@router.post("/generate", response_model=GenerateResponse)
async def generate_image(req: GenerateRequest):
    """
    Initiate an image generation request.

    Returns immediately with a taskId and SSE URL.
    The client should connect to the SSE URL to receive real-time updates.
    """
    # Generate our internal task ID
    task_id = str(uuid.uuid4())
    print(f"[Generate] Creating task: {task_id} for prompt: {req.prompt[:50]}...")

    # Create SSE connection for this task
    try:
        await sse_manager.create_connection(task_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e

    # Construct our webhook URL
    webhook_url = f"{settings.server_url}/webhook/{task_id}"
    print(f"[Generate] Webhook URL: {webhook_url}")

    try:
        # Call Z-Image API with our webhook callback
        z_task_id = await create_z_image_task(
            prompt=req.prompt,
            aspect_ratio=req.aspect_ratio,
            callback_url=webhook_url,
            api_key=req.api_key,
            nsfw_checker=req.nsfw_checker
        )
        print(f"[Generate] Z-Image task created: {z_task_id}")
    except Exception as e:
        # Cleanup SSE connection on failure
        sse_manager.connections.pop(task_id, None)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create Z-Image task: {str(e)}"
        ) from e

    return GenerateResponse(
        taskId=task_id,
        sseUrl=f"/sse/{task_id}",
        zTaskId=z_task_id
    )
