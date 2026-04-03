import { API_BASE_URL, API_KEY } from '../config/api';
import type {
  CreateTaskRequest,
  CreateTaskResponse,
  TaskStatusResponse,
  TaskResult,
  TaskState,
} from '../types/zImage';

export async function createTask(prompt: string): Promise<string> {
  const requestBody: CreateTaskRequest = {
    model: 'z-image',
    input: {
      prompt,
      aspect_ratio: '1:1',
      nsfw_checker: true,
    },
  };

  const response = await fetch(`${API_BASE_URL}/api/v1/jobs/createTask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(`Failed to create task: ${response.statusText}`);
  }

  const data: CreateTaskResponse = await response.json();

  if (data.code !== 200) {
    throw new Error(`API error: ${data.msg}`);
  }

  return data.data.taskId;
}

export async function getTaskStatus(taskId: string): Promise<{ state: TaskState; resultUrls?: string[] }> {
  const response = await fetch(`${API_BASE_URL}/api/v1/jobs/recordInfo?taskId=${taskId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get task status: ${response.statusText}`);
  }

  const data: TaskStatusResponse = await response.json();

  if (data.code !== 200) {
    throw new Error(`API error: ${data.msg}`);
  }

  const { state, resultJson } = data.data;
  let resultUrls: string[] | undefined;

  if (state === 'success' && resultJson) {
    try {
      const result: TaskResult = JSON.parse(resultJson);
      resultUrls = result.resultUrls;
    } catch (e) {
      console.error('Failed to parse resultJson:', e);
    }
  }

  return { state, resultUrls };
}
