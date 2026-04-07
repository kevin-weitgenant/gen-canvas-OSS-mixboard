"""Response schemas for API endpoints."""

from pydantic import BaseModel


class SseSessionResponse(BaseModel):
    """Schema for SSE session creation response."""
    sessionId: str
    webhookUrl: str
    sseUrl: str


class WebhookResponse(BaseModel):
    """Schema for webhook response."""
    status: str


class ChatVariationsResponse(BaseModel):
    """Schema for chat prompt variations response."""
    prompts: list[str]
