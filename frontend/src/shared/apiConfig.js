const rawApiUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').trim().replace(/\/+$/, '');
export const API_BASE_URL = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;
