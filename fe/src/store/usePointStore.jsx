import { create } from "zustand"

const usePointStore =  create((set) => ({
    point: 0,
    setPoint: (value) => set({ point: value || 0 }),
}));

export default usePointStore;