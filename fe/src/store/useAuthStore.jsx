import { create } from 'zustand'

const useAuthStore = create((set) => ({
  nickname: '',
  setNickname: (nickname) => set({ nickname }),
}));

export default useAuthStore;