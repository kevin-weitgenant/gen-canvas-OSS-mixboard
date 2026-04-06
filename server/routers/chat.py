"""Chat router for AI prompt generation."""

from fastapi import APIRouter, HTTPException
from schemas.requests import ChatVariationsRequest
from schemas.responses import ChatVariationsResponse
from services.groq_chat import generate_prompt_variations, GroqChatError

router = APIRouter()


@router.post(
    "/chat/variations",
    response_model=ChatVariationsResponse,
    summary="Generate Prompt Variations",
    description="Generate multiple variations of an image prompt using AI.",
    tags=["chat"],
)
async def create_prompt_variations(request: ChatVariationsRequest) -> ChatVariationsResponse:
    """
    Generate prompt variations based on the provided instruction.

    Args:
        request: Chat variations request with instruction and count

    Returns:
        ChatVariationsResponse with list of generated prompts

    Raises:
        HTTPException: If the Groq API call fails
    """
    try:
        prompts = await generate_prompt_variations(
            instruction=request.instruction,
            count=request.count
        )
        return ChatVariationsResponse(prompts=prompts)
    except GroqChatError as e:
        # Use the status code from the error, default to 500 if not set
        status_code = e.status_code if e.status_code is not None else 500
        raise HTTPException(
            status_code=status_code,
            detail={
                "message": str(e),
                "original_error": e.original_error
            }
        ) from e
