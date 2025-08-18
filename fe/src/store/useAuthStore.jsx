import { create } from 'zustand'

const useAuthStore = create((set) => ({
  user: null,
  setUser: (u) => set({ user: u }),
  clearUser: () => set({ user: null }),
}));

export default useAuthStore;