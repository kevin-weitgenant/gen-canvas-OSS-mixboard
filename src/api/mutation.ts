import { FASTAPI_URL } from "../config/api";

export const customFetch = async <T>(
  url: string,
  { headers, ...options }: RequestInit = {},
): Promise<T> => {
  const baseUrl = FASTAPI_URL || "http://localhost:8000";
  const fullUrl = url.startsWith("http") ? url : `${baseUrl}${url}`;

  const response = await fetch(fullUrl, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });

  const data = await response.json();

  // Return orval response format with status, data, and headers
  return {
    status: response.status,
    data,
    headers: response.headers,
  } as T;
};
