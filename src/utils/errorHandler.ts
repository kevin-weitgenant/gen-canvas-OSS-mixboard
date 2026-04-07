import { toast } from "sonner";

// Error message constants for consistency
export const ERROR_MESSAGES = {
  MISSING_API_KEY: "API key is required. Please add your Kie.ai API key.",
  MISSING_API_KEY_DESCRIPTION: "Click the API Key button at the bottom of the screen to add your key.",
  GENERATION_FAILED: "Failed to start image generation",
} as const;

// Check if error is related to missing API key
function isMissingApiKeyError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.includes("API key is required");
  }
  return false;
}

// Handle image generation errors with appropriate toast notifications
export function handleImageGenerationError(error: unknown): void {
  console.error("Image generation error:", error);

  if (isMissingApiKeyError(error)) {
    toast.error(ERROR_MESSAGES.MISSING_API_KEY, {
      description: ERROR_MESSAGES.MISSING_API_KEY_DESCRIPTION,
      duration: 999999, // Only dismiss on click
    });
  } else {
    // Generic error for other failures
    const message = error instanceof Error ? error.message : ERROR_MESSAGES.GENERATION_FAILED;
    toast.error(message, {
      description: "Please try again.",
    });
  }
}
