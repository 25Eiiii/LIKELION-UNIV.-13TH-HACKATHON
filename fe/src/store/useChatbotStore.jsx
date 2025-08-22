import { create } from "zustand";
import { persist } from "zustand/middleware";
import useAuthStore from "./useAuthStore";

const useChatbotStore = create(
  persist(
    (set, get) => ({
      chatbotName: "부기", 
      messages: [],
      isLoading: false,
      initialQuestion: null,

      addMessage: (msg) =>
        set((state) => ({ messages: [...state.messages, msg] })),

      // 대화 내용 삭제
      clearChatHistory: () => set({ messages: [] }),
      
      // 1. 첫 질문 설정 및 이전 대화 기록 삭제 
      setInitialQuestion: (question) => set({ 
        messages: [],
        initialQuestion: question
      }),

      // 2. 사용자 메시지 추가, API 호출
      sendMessageToApi: async (messageText, senderId, authToken = null) => {
        // isLoading 상태가 이미 true이면 중복 요청 방지
        if (get().isLoading) return;
        set({ isLoading: true });

        // 사용자 메시지 추가 (API 호출 전에 화면에 먼저 표시)
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

          if (res.status === 504) {
            throw new Error("timeout");
          }

          if (!res.ok) {
            throw new Error(`http error status: ${res.status}`);
          }

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
            text: "네트워크가 불안정합니다. 잠시 후 다시 시도해주세요.",
            sender: "bot",
          };
          get().addMessage(errorMessage);
        } finally {
          set({ isLoading: false });
        }
      },
      fetchSuggestions: async () => {
        try {
          const res = await fetch("/api/chatbot/suggestions/?k=3");
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          const data = await res.json();
          return data;
        } catch (error) {
          console.log("추천 질문 로딩 실패: ", error.message);
          return [];
        }
      },
      fetchSimilarEvents: async (userId, anchorEventId) => {
        try {
            const token = useAuthStore.getState().token;
            if (!token) {
              console.error("인증 토큰이 없어 API를 호출할 수 없습니다.");
              return null;
            }
            
            const res = await fetch(`/api/recommend/similar_from_last/`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (!res.ok) {
              throw new Error(`서버 에러 발생 상태 코드: ${res.status}`);
            }
            
            const data = await res.json();
            return data;

        } catch (error) {
            console.error("유사 추천 행사 로딩 실패:", error.message);
            return null;
        }
      },
    }),
    {
      name: "chatbot-storage",
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(([key]) => !['isLoading'].includes(key))
        ),
      storage: {
        getItem: (key) => {
          const value = localStorage.getItem(key);
          return value ? JSON.parse(value) : null;
        },
        setItem: (key, value) => {
          localStorage.setItem(key, JSON.stringify(value));
        },
        removeItem: (key) => localStorage.removeItem(key),
      },
    }
  )
);

export default useChatbotStore;