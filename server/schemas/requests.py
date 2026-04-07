"""Request schemas for API endpoints."""

from pydantic import BaseModel


class GenerateRequest(BaseModel):
    """Schema for image generation request."""
    prompt: str
    aspect_ratio: str = "1:1"
    nsfw_checker: bool = False
    api_key: str


class ChatVariationsRequest(BaseModel):
    """Schema for chat prompt variations request."""
    instruction: str
    count: int = 3
