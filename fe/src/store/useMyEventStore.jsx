import { create } from 'zustand'

const useMyEventStore = create((set) => ({
    events: [],
    setEvents: (data) => set({ events: data }),
}));

export default useMyEventStore;

