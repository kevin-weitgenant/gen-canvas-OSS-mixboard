"""Groq chat service for AI prompt generation."""

import json
import logging
from typing import Any
from groq import AsyncGroq, APIConnectionError, RateLimitError, APIStatusError
from config import settings, GROQ_MODEL

logger = logging.getLogger(__name__)


class GroqChatError(RuntimeError):
    """Exception raised when Groq API call fails."""
    def __init__(self, message: str, status_code: int | None = None, original_error: str | None = None):
        super().__init__(message)
        self.status_code = status_code
        self.original_error = original_error


def _build_prompt_creator_text(instruction: str, count: int) -> str:
    """Build the prompt text for Groq API."""
    return f'''Generate {count} different image prompt variations based on this instruction: "{instruction}"

Return your response as a JSON object with a "prompts" array containing the variation strings.
Example format: {{"prompts": ["variation 1", "variation 2", "variation 3"]}}'''


async def generate_prompt_variations(instruction: str, count: int) -> list[str]:
    """
    Generate prompt variations using Groq API.

    Args:
        instruction: The instruction for generating variations
        count: Number of variations to generate

    Returns:
        List of generated prompt strings

    Raises:
        GroqChatError: If the API call fails
    """
    client = AsyncGroq(api_key=settings.groq_api_key)

    prompt_text = _build_prompt_creator_text(instruction, count)

    try:
        response = await client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt_text,
                }
            ],
            model=GROQ_MODEL,
            response_format={
                "type": "json_object"
            }
        )

        choice = response.choices[0]
        if not choice or not choice.message or not choice.message.content:
            raise GroqChatError("No content in Groq response")

        content = choice.message.content

        parsed = json.loads(content)
        prompts = parsed.get("prompts", [])

        if not isinstance(prompts, list):
            raise GroqChatError("Invalid response format: prompts is not a list")

        return prompts

    except APIConnectionError as e:
        logger.error(f"Groq API connection error: {e}")
        raise GroqChatError(
            "Could not connect to AI service. Please check your internet connection.",
            status_code=None,
            original_error=str(e)
        ) from e

    except RateLimitError as e:
        logger.error(f"Groq API rate limit error: {e}")
        raise GroqChatError(
            "AI service rate limit exceeded. Please try again later.",
            status_code=429,
            original_error=str(e)
        ) from e

    except APIStatusError as e:
        logger.error(f"Groq API status error: {e.status_code} - {e.response}")
        error_detail = _extract_error_detail(e.response)

        # Handle specific error codes
        if e.status_code == 400:
            raise GroqChatError(
                f"The AI model couldn't process this request. {error_detail}",
                status_code=400,
                original_error=error_detail
            ) from e
        elif e.status_code == 401:
            raise GroqChatError(
                "AI service authentication failed.",
                status_code=401,
                original_error=error_detail
            ) from e
        elif e.status_code == 403:
            raise GroqChatError(
                "AI service permission denied.",
                status_code=403,
                original_error=error_detail
            ) from e
        elif e.status_code == 422:
            raise GroqChatError(
                f"Invalid request: {error_detail}",
                status_code=422,
                original_error=error_detail
            ) from e
        else:
            raise GroqChatError(
                f"AI service error: {error_detail}",
                status_code=e.status_code,
                original_error=error_detail
            ) from e

    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse Groq response as JSON: {e}")
        raise GroqChatError(
            "Failed to parse AI response.",
            status_code=None,
            original_error=str(e)
        ) from e


def _extract_error_detail(response: Any) -> str:
    """Extract error detail from Groq API response."""
    try:
        if hasattr(response, 'json'):
            data = response.json()
            if 'error' in data:
                error_info = data['error']
                if isinstance(error_info, dict):
                    # Check for failed_generation which contains model refusal message
                    if 'failed_generation' in error_info:
                        return "The AI model declined this request."
                    return error_info.get('message', str(error_info))
                return str(error_info)
        return str(response)
    except Exception:
        return str(response)
