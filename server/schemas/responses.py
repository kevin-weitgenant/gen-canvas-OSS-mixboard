"""Response schemas for API endpoints."""

from pydantic import BaseModel


class GenerateResponse(BaseModel):
    """Schema for image generation response."""
    taskId: str
    sseUrl: str
    zTaskId: str


class WebhookResponse(BaseModel):
    """Schema for webhook response."""
    status: str
