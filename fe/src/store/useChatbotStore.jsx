import { create } from "zustand"
import { persist } from "zustand/middleware"

const useChatbotStore = create(persist(
    (set) => ({
    chatbotName: "",    
    setChatbotName: (name) => set({ chatbotName: name }),   // chatbotName 설정하는 함수 
    
    messages: [],
    addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] }))   // messages 추가하는 함수 
    }),
    {
      name: "chatbot-storage", // localStorage에 저장되는 key
    }
  ));

export default useChatbotStore;


