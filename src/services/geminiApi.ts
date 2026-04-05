import { API_KEY } from '../config/api';

const GEMINI_API_BASE_URL = 'https://api.kie.ai';
const ENDPOINT = '/gemini-2.5-pro/v1/chat/completions';

interface GeminiResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface PromptVariationsSchema {
  prompts: string[];
}

async function apiCall<T>(url: string, options: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export function buildPromptCreatorText(instruction: string, count: number): string {
  return `Generate ${count} different image prompt variations based on this instruction: "${instruction}"

`;
}

export async function generatePromptVariations(
  instruction: string,
  count: number
): Promise<string[]> {
  console.log('🎨 [Prompt Generation] Starting...', { count, instruction });

  const requestBody = {
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: buildPromptCreatorText(instruction, count),
          },
        ],
      },
    ],
    stream: false,
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'prompt_variations',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            prompts: {
              type: 'array',
              items: { type: 'string' },
            },
          },
          required: ['prompts'],
        },
      },
    },
  };

  console.log('📤 [Prompt Generation] Sending request to Gemini API');

  const data = await apiCall<GeminiResponse>(
    `${GEMINI_API_BASE_URL}${ENDPOINT}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    }
  );

  const content = data.choices[0]?.message.content;
  if (!content) {
    throw new Error('No content in Gemini response');
  }

  const parsed = JSON.parse(content) as PromptVariationsSchema;
  const prompts = parsed.prompts || [];

  console.log('✅ [Prompt Generation] Complete!', { count: prompts.length, prompts });

  return prompts;
}
