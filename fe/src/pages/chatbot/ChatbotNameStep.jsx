import { useEffect, useState } from "react";
import { Container } from "../../styles/common/styledContainer";
import * as C from "../../styles/pages/styledChatbotIntro";
import { useNavigate } from "react-router-dom";
import useChatbotStore from "../../store/useChatbotStore";

const ChatbotNameStep = () => {
  const navigate = useNavigate()
  const chatbotName = useChatbotStore((state) => state.chatbotName)
  const setChatbotName = useChatbotStore((state) => state.setChatbotName);
  const resetChatbotName = useChatbotStore((state) => state.resetChatbotName)

  const handleSaveName = ()  =>  {
    if (chatbotName.trim().length>=1 && chatbotName.trim().length<=15) {
      navigate('/chatbot-start')
    } else if (chatbotName.trim().length<1) {
      alert("한글자 이상 입력해주세요.");
    } else {
      alert("15글자 이하로 입력해주세요.")
    }
  };

  useEffect(() => {
    resetChatbotName();
  }, [])

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
          onKeyDown={(e) => {
            if (e.key == "Enter") {
              handleSaveName();
            }
          }}
        ></C.NameInput>
        <C.CompleteButton onClick={handleSaveName}>완료</C.CompleteButton>
      </C.ButtonWrapper>
    </Container>
  );
};

export default ChatbotNameStep;
