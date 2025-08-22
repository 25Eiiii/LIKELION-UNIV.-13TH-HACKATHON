import { useEffect, useState } from "react";
import * as C from "../../styles/pages/styledChatbot";
import EventCard from "../../components/EventCard";
import { useNavigate } from "react-router-dom";
import useChatbotStore from "../../store/useChatbotStore";
import useAuthStore from "../../store/useAuthStore";
import { useLocation } from "../../hooks/useLocation";

const Chatbot = () => {
  const [content, setContent] = useState("");
  const navigate = useNavigate();
  const { addMessage } = useChatbotStore();
  const nickname = useAuthStore((s) => s.nickname);
  const { fetchSuggestions, fetchSimilarEvents, setInitialQuestion, sendMessageToApi } = useChatbotStore();
  const [suggestions, setSuggestions] = useState([]);
  const [recommendedEvents, setRecommendedEvents] = useState([]);
  const [recommendationMessage, setRecommendationMessage] = useState("");
  const { user } = useAuthStore();
  const [anchorEvent, setAnchorEvent] = useState(null); 

  const handleEnter = (e) => {
    if (e.key === 'Enter' && content.trim()) {
      navigate('/chatting', { state: { initialQuestion: content } });
    }
  };

  const handleClick = () => {
    if (content.trim()) {
      navigate('/chatting', { state: { initialQuestion: content } });
    }
  };

  // 추천 질문 클릭
  const handleSuggestionClick = (question) => {
    console.log("클릭된 질문:", question);
    navigate("/chatting", { state: { initialQuestion: question } });
  }

  useEffect(() => {
    const getSuggestions = async () => {
      const data = await fetchSuggestions();
      setSuggestions(data.items);
    };
    getSuggestions();
  }, [fetchSuggestions]);

 // 유사 행사 추천 목록을 불러오는 로직
  useEffect(() => {
    const loadRecommendations = async () => {
        if (user?.id) { 
            const anchorEventId = 71; 
            const data = await fetchSimilarEvents(user.id, anchorEventId);
            if (data) {
                setRecommendationMessage(data.message);
                setRecommendedEvents(data.items || []);
            }
        } else { // 비로그인 처리
            setRecommendedEvents([]);
        }
    };
    loadRecommendations();
  }, [user, fetchSimilarEvents]);

  return (
    <C.Container>
      <C.ChatbotImg>
        <img src={`${process.env.PUBLIC_URL}/images/chatbot.svg`} alt="챗봇" />
      </C.ChatbotImg>
      <C.ChatbotName>부기</C.ChatbotName>
      <C.QuestionWrapper>
        <C.QuestionTitle>오늘의 추천 질문</C.QuestionTitle>
        <C.QuestionList>
          {suggestions?.map((item, idx) => (
            <C.Question 
              key={idx}
              onClick={() => handleSuggestionClick(item.label)}
              >{item.label}</C.Question>
          ))}
        </C.QuestionList>
      </C.QuestionWrapper>
      <C.Recommend>
        <C.RecText>
          <p style={{ margin: "0px" }}>
            {recommendationMessage}
          </p>
        </C.RecText>
        <C.RecList>
          {recommendedEvents.map((event, idx) => (
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