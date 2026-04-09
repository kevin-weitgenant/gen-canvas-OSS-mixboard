"""Nano Banana 2 API service for creating image generation tasks."""

import httpx

from config import settings  # type: ignore


class NanoBananaAPIError(RuntimeError):
    """Exception raised when the Nano Banana 2 API returns an error."""


NANO_BANANA_API_BASE = "https://api.kie.ai"
CREATE_TASK_ENDPOINT = "/api/v1/jobs/createTask"


async def create_nano_banana_task(
    prompt: str,
    aspect_ratio: str,
    callback_url: str,
    api_key: str,
    nsfw_checker: bool = False
) -> str:
    """Create a Nano Banana 2 generation task with webhook callback."""

    payload = {
        "model": "nano-banana-2",
        "callBackUrl": callback_url,
        "input": {
            "prompt": prompt,
            "aspect_ratio": aspect_ratio,
            "nsfw_checker": nsfw_checker
        }
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{NANO_BANANA_API_BASE}{CREATE_TASK_ENDPOINT}",
            json=payload,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            },
            timeout=30.0
        )
        response.raise_for_status()

        result = response.json()
        if result.get("code") != 200:
            raise NanoBananaAPIError(f"Nano Banana 2 API error: {result.get('msg')}")

        return result["data"]["taskId"]
