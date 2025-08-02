import { useState } from "react";
import { Container } from "../../styles/common/styledContainer";
import * as C from "../../styles/pages/styledChatbotIntro";
import { useNavigate } from "react-router-dom";

const ChatbotNameStep = () => {
  const navigate = useNavigate()
  const [chatbotName, setChatbotName] = useState("")

  const handleSaveName = ()  =>  {
    localStorage.setItem("chatbotName", chatbotName);
    navigate("/chatbot-start");
  };

  return (
    <Container>
      <C.Welcome>
      <img src={`${process.env.PUBLIC_URL}/images/chatbotintro.svg`} alt="챗봇" />
        <p style={{ margin: "0px" }}>저의 <span style={{ color: "#4DB080" }}>이름</span>을 지어주세요!</p>
      </C.Welcome>
      <C.ButtonWrapper>
        <C.NameInput
          value={chatbotName}
          onChange={(e) => setChatbotName(e.target.value)}
        ></C.NameInput>
        <C.CompleteButton onClick={handleSaveName}>완료</C.CompleteButton>
      </C.ButtonWrapper>
    </Container>
  );
};

export default ChatbotNameStep;
