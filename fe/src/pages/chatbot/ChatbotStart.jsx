import { useEffect, useState } from "react";
import { Container } from "../../styles/common/styledContainer";
import * as C from "../../styles/pages/styledChatbotIntro";
import { useNavigate } from "react-router-dom";
import useChatbotStore from "../../store/useChatbotStore";

const ChatbotStart = () => {
  const navigate = useNavigate();
  const chatbotName = useChatbotStore((state) => state.chatbotName)

  useEffect(() => {
    const handleEnter = (e) => {
      if (e.key === "Enter") {
        navigate('/chatbot');
      }
    };
    window.addEventListener("keydown", handleEnter);
    return () => {
      window.removeEventListener("keydown", handleEnter)
    }
  })
  
  return (
    <Container>
      <C.Welcome>
      <img src={`${process.env.PUBLIC_URL}/images/chatbotintro.svg`} alt="챗봇" />
        <p>그럼 이제부터 <span style={{ color: "#4DB080" }}>{chatbotName}🌟</span>와 함께<br></br> 성북 문화 생활을 즐기러 가볼까요?</p>
      </C.Welcome>
      <C.ButtonWrapper>
        <C.CompleteButton 
          onClick={() => navigate('/chatbot')}
          >시작하기</C.CompleteButton>
      </C.ButtonWrapper>
    </Container>
  );
};

export default ChatbotStart;
