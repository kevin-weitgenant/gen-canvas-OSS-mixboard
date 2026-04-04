interface ApiResponse<T = unknown> {
  code: number;
  msg: string;
  data: T;
}

interface ApiCallOptions extends RequestInit {
  headers?: Record<string, string>;
}

export async function apiCall<T>(
  url: string,
  options: ApiCallOptions,
  errorMessage: string
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`${errorMessage}: ${response.statusText}`);
  }

  const result: ApiResponse<T> = await response.json();

  if (result.code !== 200) {
    throw new Error(`API error: ${result.msg}`);
  }

  return result.data;
}
