"""Z-Image API service for creating image generation tasks."""

import httpx

from config import settings  # type: ignore


class ZImageAPIError(RuntimeError):
    """Exception raised when the Z-Image API returns an error."""


Z_IMAGE_API_BASE = "https://api.kie.ai"
CREATE_TASK_ENDPOINT = "/api/v1/jobs/createTask"


async def create_z_image_task(
    prompt: str,
    aspect_ratio: str,
    callback_url: str,
    nsfw_checker: bool = False
) -> str:
    """Create a Z-Image generation task with webhook callback."""

    payload = {
        "model": "z-image",
        "callBackUrl": callback_url,
        "input": {
            "prompt": prompt,
            "aspect_ratio": aspect_ratio,
            "nsfw_checker": nsfw_checker
        }
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{Z_IMAGE_API_BASE}{CREATE_TASK_ENDPOINT}",
            json=payload,
            headers={
                "Authorization": f"Bearer {settings.kie_ai_api_key}",
                "Content-Type": "application/json"
            },
            timeout=30.0
        )
        response.raise_for_status()

        result = response.json()
        if result.get("code") != 200:
            raise ZImageAPIError(f"Z-Image API error: {result.get('msg')}")

        return result["data"]["taskId"]
