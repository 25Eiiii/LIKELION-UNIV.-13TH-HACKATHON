import { useEffect, useState } from "react";
import * as C from "../../styles/pages/styledChatbot";
import EventCard from "../../components/EventCard";
import { useNavigate } from "react-router-dom";
import useChatbotStore from "../../store/useChatbotStore";
import useAuthStore from "../../store/useAuthStore";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { jwtDecode } from "jwt-decode"; // ✅ 추가

const Chatbot = () => {
  const [content, setContent] = useState("");
  const navigate = useNavigate();
  const qc = useQueryClient();

  // 닉네임/토큰 파생
  const nickname =
    useAuthStore((s) => s.nickname) || localStorage.getItem("nickname") || "";
  const rawToken =
    useAuthStore((s) => s.token || s.accessToken || s.access) ||
    localStorage.getItem("accessToken") ||
    "";
  const hasToken = Boolean(rawToken);

  // ✅ 토큰에서 user_id 직접 추출 (스토어 user 채워지기 전에도 사용 가능)
  let decodedUserId = undefined;
  try {
    const payload = rawToken ? jwtDecode(rawToken) : null;
    decodedUserId = payload?.user_id || payload?.id || payload?.sub;
  } catch (e) {
    decodedUserId = undefined;
  }

  const { fetchSuggestions, fetchSimilarEvents } = useChatbotStore();

  // 1) 오늘의 추천 질문
  const { data: suggestionList = [] } = useQuery({
    queryKey: ["chatbot-suggestions", hasToken],
    queryFn: async () => {
      const d = await fetchSuggestions();
      return Array.isArray(d?.items) ? d.items : [];
    },
    select: (rows) => (Array.isArray(rows) ? rows : []),
    staleTime: 0,
    refetchOnMount: "always",
    retry: false,
  });

  // 2) 유사 행사 (✅ user?.id 대신 decodedUserId 사용)
  const anchorEventId = 71; // 필요시 외부에서 주입하도록 변경 가능
  const { data: similar = { message: "", items: [] } } = useQuery({
    queryKey: ["chatbot-similar", hasToken, decodedUserId, anchorEventId],
    // ✅ 토큰만 있으면 일단 시도 → 백엔드가 토큰에서 사용자 식별
    enabled: hasToken && !!anchorEventId,
    queryFn: async () => {
      const uid = decodedUserId; // 없으면 백엔드가 토큰으로 식별
      const d = await fetchSimilarEvents(uid, anchorEventId);
      return {
        message: d?.message ?? "",
        items: Array.isArray(d?.items) ? d.items : [],
      };
    },
    staleTime: 0,
    refetchOnMount: "always",
    retry: false,
  });

  // 로그인/로그아웃 시 즉시 최신화
  useEffect(() => {
    qc.invalidateQueries({ queryKey: ["chatbot-suggestions"] });
    qc.invalidateQueries({ queryKey: ["chatbot-similar"] });
  }, [qc, hasToken, decodedUserId]);

  const handleEnter = (e) => {
    if (e.key === "Enter" && content.trim()) {
      navigate("/chatting", { state: { initialQuestion: content } });
    }
  };
  const handleClick = () => {
    if (content.trim()) {
      navigate("/chatting", { state: { initialQuestion: content } });
    }
  };
  const handleSuggestionClick = (question) => {
    navigate("/chatting", { state: { initialQuestion: question } });
  };

  return (
    <C.Container>
      <C.ChatbotImg>
        <img src={`${process.env.PUBLIC_URL}/images/chatbot.svg`} alt="챗봇" />
      </C.ChatbotImg>
      <C.ChatbotName>부기</C.ChatbotName>

      <C.QuestionWrapper>
        <C.QuestionTitle>오늘의 추천 질문</C.QuestionTitle>
        <C.QuestionList>
          {suggestionList.map((item, idx) => (
            <C.Question key={idx} onClick={() => handleSuggestionClick(item.label)}>
              {item.label}
            </C.Question>
          ))}
        </C.QuestionList>
      </C.QuestionWrapper>

      <C.Recommend>
        <C.RecText>
          <p style={{ margin: 0 }}>{similar.message}</p>
        </C.RecText>
        <C.RecList>
          {similar.items.map((event) => (
            <EventCard
              key={event.id}
              name={event.title}
              date={event.date_text}
              image={event.main_img}
              onClick={() => navigate(`/detailInfo/${event.id}`)}
              w={144}
              h={168}
            />
          ))}
        </C.RecList>
      </C.Recommend>

      <C.SendWrapper>
        <C.SendInput
          placeholder="메시지를 입력해주세요"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleEnter}
        />
        <C.SendBtn onClick={handleClick}>
          <img src={`${process.env.PUBLIC_URL}/images/send.svg`} alt="send" />
        </C.SendBtn>
      </C.SendWrapper>
    </C.Container>
  );
};

export default Chatbot;
