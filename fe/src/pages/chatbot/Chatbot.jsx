import { useState } from "react";
import * as C from "../../styles/pages/styledChatbot";
import EventCard from "../../components/EventCard";
import { useNavigate } from "react-router-dom";
import useChatbotStore from "../../store/useChatbotStore";

const Chatbot = () => {
  const [content, setContent] = useState("");
  const chatbotName = useChatbotStore((state) => state.chatbotName);
  const navigate = useNavigate();
  const { addMessage } = useChatbotStore();

  const handleEnter = (e) => {
    if (e.key === 'Enter' && content.trim()) {
      addMessage({ sender: "user", text: content });
      navigate('/chatting');
    }
  };

  const handleClick = () => {
    if (content.trim()) {
      addMessage({ sender: "user", text: content });
      navigate('/chatting');
    }
  };

  return (
    <C.Container>
      <C.ChatbotImg>
        <img src={`${process.env.PUBLIC_URL}/images/chatbot.svg`} alt="챗봇" />
      </C.ChatbotImg>
      <C.ChatbotName>{chatbotName}</C.ChatbotName>
      <C.QuestionWrapper>
        <C.QuestionTitle>오늘의 추천 질문</C.QuestionTitle>
        <C.QuestionList>
          {questions.map((item, idx) => (
            <C.Question key={idx}>{item.que}</C.Question>
          ))}
        </C.QuestionList>
      </C.QuestionWrapper>
      <C.Recommend>
        <C.RecText>
          <p style={{ margin: "0px" }}>
            효민님 지난 달 참여하였던<br />
            <span style={{ color: "#159054" }}>피카소 전시 따라잡기</span> 와 비슷한 행사를 추천해드릴게요
          </p>
        </C.RecText>
        <C.RecList>
          {recs.map((event, idx) => (
            <EventCard key={idx} {...event} w={107} h={154} />
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
        <C.SendBtn onClick={handleClick} />
      </C.SendWrapper>
    </C.Container>
  );
};


export default Chatbot;

export const questions = [
    {
        que: "이번 주 내 근처 문화 활동 추천 해줄래?"
    },
    {
        que: "이번 달 인기 문화 행사가 뭐야?"
    },
    {
        que: "내 활동 리포트 보여줘"
    },
]

export const recs = [
    {
        name: "제목",
        place: "장소",
        date: "2024.01.30 - 4.26",
        image: "post.svg"
    },
    {
        name: "제목",
        place: "장소",
        date: "2024.01.30 - 4.26",
        image: "post.svg"
    },
    {
        name: "제목",
        place: "장소",
        date: "2024.01.30 - 4.26",
        image: "post.svg"
    },
]