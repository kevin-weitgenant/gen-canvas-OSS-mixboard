const API_BASE_URL = 'https://api.kie.ai';
const API_KEY = import.meta.env.VITE_KIE_AI_API_KEY;

if (!API_KEY) {
  console.warn('VITE_KIE_AI_API_KEY is not configured');
}

export { API_BASE_URL, API_KEY };
