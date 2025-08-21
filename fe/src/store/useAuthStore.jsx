import { create } from 'zustand'

const useAuthStore = create((set) => ({
  nickname: localStorage.getItem('nickname') || '',
  setNickname: (nickname) => {
    localStorage.setItem('nickname', nickname);
    set({ nickname });
  },
  clearNickname: () => {
    localStorage.removeItem('nickname');
    set({ nickname: '' });
  }
}));

export default useAuthStore;