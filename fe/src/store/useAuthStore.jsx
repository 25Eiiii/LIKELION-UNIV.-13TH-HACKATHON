import { create } from 'zustand'

const useAuthStore = create((set) => {
  // 스토어 초기화 시 로컬 스토리지에서 데이터 로드
  const storedToken = localStorage.getItem('token');
  const storedNickname = localStorage.getItem('nickname');
  const storedUserId = localStorage.getItem('userId');

  return {
    user: storedUserId ? { id: storedUserId } : null, // ID가 있으면 user 객체 생성
    nickname: storedNickname || '',
    token: storedToken,
    
    setNickname: (nickname) => {
      localStorage.setItem('nickname', nickname);
      set({ nickname });
    },
    clearNickname: () => {
      localStorage.removeItem('nickname');
      set({ nickname: '' });
    },
    login: (token, userId, nickname) => {
      localStorage.setItem("token", token);
      localStorage.setItem("nickname", nickname);
      localStorage.setItem("userId", userId); // userId를 로컬 스토리지에 저장
      set({ token, user: { id: userId }, nickname }); // user 객체를 설정
    },
    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('nickname');
      localStorage.removeItem('userId');
      set({ token: null, user: null, nickname: null });
    },
  };
});

export default useAuthStore;