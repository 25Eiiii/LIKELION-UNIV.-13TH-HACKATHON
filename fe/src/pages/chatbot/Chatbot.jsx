import { useEffect, useState } from "react";
import * as C from "../../styles/pages/styledChatbot";
import EventCard from "../../components/EventCard";
import { useNavigate } from "react-router-dom";
import useChatbotStore from "../../store/useChatbotStore";
import useAuthStore from "../../store/useAuthStore";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const Chatbot = () => {
  const [content, setContent] = useState("");
  const navigate = useNavigate();
  const qc = useQueryClient();

  const nickname =
    useAuthStore((s) => s.nickname) || localStorage.getItem("nickname") || "";
  const storeToken =
    useAuthStore((s) => s.token || s.accessToken || s.access) ||
    localStorage.getItem("accessToken") ||
    "";
  const hasToken = Boolean(storeToken);

  const user = useAuthStore((s) => s.user);

  // store에서 API 함수만 꺼내서 사용(내부에서 api 인스턴스 쓰도록)
  const { fetchSuggestions, fetchSimilarEvents } = useChatbotStore();

  // 1) 오늘의 추천 질문
  const {
    data: suggestionList = [],
  } = useQuery({
    queryKey: ["chatbot-suggestions", hasToken], // 토큰 변화에 반응
    queryFn: async () => {
      const d = await fetchSuggestions();
      return Array.isArray(d?.items) ? d.items : [];
    },
    select: (rows) => (Array.isArray(rows) ? rows : []),
    staleTime: 0,
    refetchOnMount: "always",
    retry: false,
  });

  // 2) 유사 행사 (로그인 필요 시 hasToken && user?.id 가 있을 때만)
  const anchorEventId = 71; // TODO: 고정값이 맞다면 유지, 아니면 라우트/상태에서 받아오기
  const {
    data: similar = { message: "", items: [] },
  } = useQuery({
    queryKey: ["chatbot-similar", hasToken, user?.id, anchorEventId],
    enabled: hasToken && !!user?.id && !!anchorEventId,
    queryFn: async () => {
      const d = await fetchSimilarEvents(user.id, anchorEventId);
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
  }, [qc, hasToken, user?.id]);

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
