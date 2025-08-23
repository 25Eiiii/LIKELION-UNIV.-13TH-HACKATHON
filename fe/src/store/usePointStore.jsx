// src/store/usePointStore.js
import { create } from "zustand";

const usePointStore = create((set, get) => ({
  point: 0,
  setPoint: (v) => {
    const n = Number(v) || 0;
    if (process.env.NODE_ENV !== "production") {
      console.log("[usePointStore] setPoint called with:", v, "→", n);
    }
    set({ point: n });
  },
  addPoint: (delta) =>
    set((s) => {
      const next = Math.max(0, (Number(s.point) || 0) + Number(delta || 0));
      if (process.env.NODE_ENV !== "production") {
        console.log("[usePointStore] addPoint:", delta, "→", next);
      }
      return { point: next };
    }),
}));

if (process.env.NODE_ENV !== "production") {
  const unsub = usePointStore.subscribe((state) => {
    console.log("[usePointStore] state changed:", state);
  });
}

export default usePointStore;
