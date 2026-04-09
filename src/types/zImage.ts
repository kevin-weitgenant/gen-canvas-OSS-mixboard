export type TaskState = 'waiting' | 'queuing' | 'generating' | 'success' | 'fail';

export interface CreateTaskRequest {
  model: 'nano-banana-2';
  input: {
    prompt: string;
    aspect_ratio: '1:1' | '4:3' | '3:4' | '16:9' | '9:16';
    nsfw_checker?: boolean;
  };
}

export interface CreateTaskResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
  };
}

export interface TaskStatusData {
  taskId: string;
  state: TaskState;
  model: string;
  resultJson?: string;
}

export interface TaskStatusResponse {
  code: number;
  msg: string;
  data: TaskStatusData;
}

export interface TaskResult {
  resultUrls: string[];
}

export type ImageLoadingState = 'idle' | 'creating' | 'polling' | 'success' | 'failed';
