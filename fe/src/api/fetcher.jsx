import useAuthStore from '../store/useAuthStore'; // Auth 스토어를 가져옵니다.

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

/**
 * 앱의 모든 API 요청을 처리하는 중앙 fetcher 함수
 * @param {string} path - /api/.... 와 같은 API 경로
 * @param {object} options - fetch에 전달할 옵션 (method, body 등)
 * @returns {Promise<any>} - 성공 시 JSON 데이터, 실패 시 에러 throw
 */
export async function apiFetcher(path, options = {}) {
  // 1. 스토어에서 현재 토큰을 가져옵니다.
  const token = useAuthStore.getState().token;

  const url = new URL(path, API_BASE);
  
  // 2. 요청 헤더를 구성합니다. 토큰이 있으면 Authorization 헤더를 추가합니다.
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, { ...options, headers });

    // 3. ✨ 여기가 핵심! 응답 상태가 401(Unauthorized)이면 자동 로그아웃 처리
    if (response.status === 401) {
      console.log("토큰 만료 또는 인증 실패. 자동 로그아웃을 실행합니다.");
      // useAuthStore의 logout 액션을 직접 호출합니다.
      useAuthStore.getState().logout(); 
      // 에러를 발생시켜 react-query가 'error' 상태로 전환하도록 합니다.
      throw new Error('인증이 만료되었습니다.');
    }

    if (!response.ok) {
      throw new Error(`서버 에러 발생! (상태: ${response.status})`);
    }

    // 응답 본문이 비어있을 수 있으므로 확인 후 JSON 파싱
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return response.json();
    }
    return null; // JSON이 아닌 경우 null 반환

  } catch (error) {
    console.error('API 요청 실패:', error);
    throw error; // 에러를 다시 throw하여 useQuery가 감지하도록 함
  }
}
