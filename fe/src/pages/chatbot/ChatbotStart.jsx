import { useEffect, useState } from "react";
import { Container } from "../../styles/common/styledContainer";
import * as C from "../../styles/pages/styledChatbot";
import { useNavigate } from "react-router-dom";

const ChatbotStart = () => {
  const navigate = useNavigate()
  const [name, setName] = useState("");

  useEffect(() => {
    const storedName = localStorage.getItem("chatbotName");
    if (storedName) {
        setName(storedName);
    }
  }, [])
  
  return (
    <Container>
      <C.Welcome>
      <img src={`${process.env.PUBLIC_URL}/images/chatbotintro.svg`} alt="챗봇" />
        <p>그럼 이제부터 <span style={{ color: "#4DB080" }}>{name}🌟</span>와 함께<br></br> 성북 문화 생활을 즐기러 가볼까요?</p>
      </C.Welcome>
      <C.ButtonWrapper>
        <C.CompleteButton onClick={() => navigate('/chatbot')}>시작하기</C.CompleteButton>
      </C.ButtonWrapper>
    </Container>
  );
};

export default ChatbotStart;
