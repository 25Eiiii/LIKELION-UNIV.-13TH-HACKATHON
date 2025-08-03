import { create } from "zustand";
import { persist } from "zustand/middleware";

const useChatbotStore = create(
  persist(
    (set) => ({
      chatbotName: "",
      setChatbotName: (name) => set({ chatbotName: name }),
      resetChatbotName: () => set({ chatbotName: "" }),

      messages: [],
      addMessage: (msg) =>
        set((state) => ({ messages: [...state.messages, msg] })),
      resetMessages: () => set({ messages: [] }),
    }),
    {
      name: "chatbot-storage",
      storage: {
        getItem: (key) => {
          const value = sessionStorage.getItem(key);
          return value ? JSON.parse(value) : null;
        },
        setItem: (key, value) => {
          sessionStorage.setItem(key, JSON.stringify(value));
        },
        removeItem: (key) => sessionStorage.removeItem(key),
      },
    }
  )
);

export default useChatbotStore;
