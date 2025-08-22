import { create } from "zustand";
import { persist } from "zustand/middleware";

const useChatbotStore = create(
  persist(
    (set, get) => ({
      chatbotName: "",
      setChatbotName: (name) => set({ chatbotName: name }),
      resetChatbotName: () => set({ chatbotName: "" }),

      messages: [],
      addMessage: (msg) =>
        set((state) => ({ messages: [...state.messages, msg] })),
      resetMessages: () => set({ messages: [] }),
    
      isLoading: false,
      setIsLoading: (s) => set({ isLoading: s }),

      // 데이터 구성
      sendMessageToApi: async (messageText, senderId, authToken = null) => {
        set({ isLoading: true });

        // 사용자 메세지 추가
        const userMessage = {
          id: Date.now(),
          text: messageText,
          sender: "user",
        };
        get().addMessage(userMessage);

        try {
          const requestBody = {
            sender: senderId,
            message: messageText,
            metadata: {},
          };
          if (authToken) {
            requestBody.metadata.auth_token = authToken;
          }
          
          const res = await fetch("http://localhost:5005/webhooks/rest/webhook", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
          });

          // HTTP 타임 아웃
          if (res.status === 504) {
            throw new Error("timeout");
          }

          if (!res.ok) {
            throw new Error(`http error status: ${res.status}`);
          }

          // 응답 배열 순서대로 처리
          const resMessages = await res.json();
          resMessages.forEach((msg) => {
            const botMessage = {
              id: Date.now() + Math.random(),
              text: msg.text,
              sender: "bot",
              buttons: msg.buttons,
            };
            get().addMessage(botMessage);
          });
        } catch (error) {
          console.error("API error:", error);
          const errorMessage = {
            id: Date.now() + 1,
            text: "네트워크가 불안정합니다.",
            sender: "bot",
          };
          get().addMessage(errorMessage);
        } finally {
          set({ isLoading: false });
        }
      },
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
