"""Request schemas for API endpoints."""

from pydantic import BaseModel


class ChatVariationsRequest(BaseModel):
    """Schema for chat prompt variations request."""
    instruction: str
    count: int = 3
