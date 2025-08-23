import useAuthStore from '../store/useAuthStore';
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE || '';

/**
 * @param {string} path 
 * @param {object} options 
 * @returns {Promise<any>} 
 */

export const api = axios.create({
  baseURL: API_BASE, // "" 이면 "/api/..."가 같은 도메인으로 붙음
  withCredentials: false,
});

// 사용 예시: api.get('/api/top3/monthly/')


export async function apiFetcher(path, options = {}) {

  const token = useAuthStore.getState().token;

  const url = new URL(path, API_BASE);
  

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
      console.log("토큰 만료 또는 인증 실패. 자동 로그아웃을 실행합니다.");
      useAuthStore.getState().logout(); 
      throw new Error('인증이 만료되었습니다.');
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
