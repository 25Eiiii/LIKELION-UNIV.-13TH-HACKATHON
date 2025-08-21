import { create } from 'zustand'

const useAuthStore = create((set) => ({
  nickname: localStorage.getItem('nickname') || '',
  token: localStorage.getItem('token'),
  setNickname: (nickname) => {
    localStorage.setItem('nickname', nickname);
    set({ nickname });
  },
  clearNickname: () => {
    localStorage.removeItem('nickname');
    set({ nickname: '' });
  },
  login: (token, user, nickname) => {
    localStorage.setItem("token", token);
    localStorage.setItem("nickname", nickname);
    set({ token, user, nickname });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('nickname');
    set({ token: null, user: null, nickname: null });
  },
}));

export default useAuthStore;