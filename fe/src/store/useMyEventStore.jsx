import { create } from 'zustand'

const useMyEventStore = create((set) => ({
    events: [],
    setEvents: (date) => set({ events: data }),
}));

export default useMyEventStore;