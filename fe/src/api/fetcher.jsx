import useAuthStore from '../store/useAuthStore';
import axios from "axios";

const API_BASE_URL = (process.env.REACT_APP_API_BASE || '').trim();

/**
 * @param {string} path 
 * @param {object} options 
 * @returns {Promise<any>} 
 */

export const api = axios.create({
  baseURL: API_BASE_URL || undefined,
  headers: { Accept: "application/json" },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


export async function apiFetcher(path, options = {}) {

  const token = useAuthStore.getState().token;

  // BASE가 비어있으면 상대경로 그대로 사용
  const url = /^https?:\/\//.test(path)
    ? path
    : (API_BASE_URL ? new URL(path, API_BASE_URL).toString() : path);


  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, { ...options, headers, cache: 'no-store' });
    if (response.status === 401) {
      const err = new Error('unauthorized');
      err.status = 401;
      throw err;
    }


    if (!response.ok) {
      throw new Error(`서버 에러 발생! (상태: ${response.status})`);
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return response.json();
    }
    return null;

  } catch (error) {
    console.error('API 요청 실패:', error);
    throw error;
  }
}
