const FASTAPI_URL = import.meta.env.VITE_FASTAPI_URL || 'http://localhost:8000';
const API_KEY = import.meta.env.VITE_KIE_AI_API_KEY || '';

if (!FASTAPI_URL) {
  console.warn('VITE_FASTAPI_URL is not configured');
}

export { FASTAPI_URL, API_KEY };
