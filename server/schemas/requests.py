"""Request schemas for API endpoints."""

from pydantic import BaseModel


class GenerateRequest(BaseModel):
    """Schema for image generation request."""
    prompt: str
    aspect_ratio: str = "1:1"
    nsfw_checker: bool = False
