import { create } from "zustand"

const usePointStore =  create((set) => ({
    point: [],
    setPoint: (value) => set({ point: value }),
}));

export default usePointStore;