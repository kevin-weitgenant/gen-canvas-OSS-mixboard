import { API_BASE_URL, API_KEY } from '../config/api';
import { apiCall } from '../utils/api';
import {
  DEFAULT_ASPECT_RATIO,
  MODEL_Z_IMAGE,
} from '../constants/imageGeneration';
import type {
  CreateTaskRequest,
  CreateTaskResponse,
  TaskStatusData,
  TaskResult,
} from '../types/zImage';

const ENDPOINTS = {
  CREATE_TASK: '/api/v1/jobs/createTask',
  TASK_STATUS: '/api/v1/jobs/recordInfo',
} as const;

export async function createTask(prompt: string): Promise<string> {
  const requestBody: CreateTaskRequest = {
    model: MODEL_Z_IMAGE,
    input: {
      prompt,
      aspect_ratio: DEFAULT_ASPECT_RATIO,
      nsfw_checker: true,
    },
  };

  const data = await apiCall<CreateTaskResponse['data']>(
    `${API_BASE_URL}${ENDPOINTS.CREATE_TASK}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    },
    'Failed to create task'
  );

  return data.taskId;
}

export async function getTaskStatus(
  taskId: string
): Promise<{ state: import('../types/zImage').TaskState; resultUrls?: string[] }> {
  const searchParams = new URLSearchParams({ taskId });

  const data = await apiCall<TaskStatusData>(
    `${API_BASE_URL}${ENDPOINTS.TASK_STATUS}?${searchParams}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
      },
    },
    'Failed to get task status'
  );

  const { state, resultJson } = data;

  if (state === 'success' && resultJson) {
    try {
      const result: TaskResult = JSON.parse(resultJson);
      return { state, resultUrls: result.resultUrls };
    } catch (e) {
      console.error('Failed to parse resultJson:', e);
    }
  }

  return { state };
}
