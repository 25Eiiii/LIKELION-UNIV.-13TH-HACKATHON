import * as T from "../../styles/pages/styledChatting";
import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // useLocation, useNavigate 확인
import useChatbotStore from "../../store/useChatbotStore";
import Header from "../../components/Header";
import { v4 as uuidv4 } from "uuid";
import ChatMessage from "../../components/ChatMessage";
import useAuthStore from "../../store/useAuthStore";

const Chatting = () => {
  const { chatbotName, messages, sendMessageToApi, isLoading } = useChatbotStore();
  const [content, setContent] = useState("");
  const [senderId, setSenderId] = useState(""); // 초기값은 빈 문자열
  const chatContainerRef = useRef(null);
  const { user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  
  useEffect(() => {
    let currentSenderId = "";

    // 1. senderId 설정 
    if (user && user.id) {
      currentSenderId = user.id;
    } else {
      let storedId = sessionStorage.getItem("senderId");
      if (!storedId) {
        storedId = uuidv4();
        sessionStorage.setItem("senderId", storedId);
      }
      currentSenderId = storedId;
    }
    setSenderId(currentSenderId); // 컴포넌트 state에 senderId 설정

    // 2. initialQuestion을 가져옴 
    const initialQuestion = location.state?.initialQuestion;

    // 3. API를 호출
    if (initialQuestion && currentSenderId) {
      console.log("API 호출 직전:", { initialQuestion, currentSenderId });
      const authToken = localStorage.getItem('accessToken');
      sendMessageToApi(initialQuestion, currentSenderId, authToken);
      
      // 중복 실행 방지
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [user, location.state]); // 의존성 배열을 user와 location.state로 변경

  // 스크롤
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);


  const handleSendMessage = (messageText) => {
    if (messageText.trim() && !isLoading && senderId) { // senderId가 있는지 확인
      const authToken = localStorage.getItem('accessToken');
      sendMessageToApi(messageText, senderId, authToken);
    }
  };

  const handleEnter = (e) => {
    if (e.key === "Enter" && content.trim()) {
      handleSendMessage(content);
      setContent("");
    }
  };

  const handleClick = () => {
    if (content.trim()) {
      handleSendMessage(content);
      setContent("");
    }
  };
  
  const today = new Date();
  const formatDate = `${today.getFullYear()}.${today.getMonth() + 1}.${today.getDate()}`;

  return (
    <T.Container>
        <Header title="부기"></Header>
        <T.Date>{formatDate}</T.Date>
        {messages.length === 0 && !isLoading && (
          <T.Guide>
            <T.GuideImg>
                <img src={`${process.env.PUBLIC_URL}/images/chatbot.svg`} alt="챗봇" />
            </T.GuideImg>
            <T.GuideInro>
                <p>
                안녕하세요 ! 성북 가이드 <span style={{ color: "#60C795" }}>{chatbotName}</span> 입니다. <br />
                <span style={{ 
                    color: "#3F3F3",
                    fontSize: "14px",
                    fontWeight: "400"
                    }}>
                    성북 문화 행사에 대해서 궁금한 내용을 말씀해 주세요.
                </span>
                </p>
            </T.GuideInro>
          </T.Guide>
        )}
        <T.ChatWrapper ref={chatContainerRef}>
        {messages?.map((msg, idx) => (
            <ChatMessage
                key={idx}
                message={msg}
                onButtonClick={(payload) => handleSendMessage(payload)}
            />
        ))}
        {isLoading && messages[messages.length - 1]?.sender === 'user' && (
            <T.MsgWrapper $isUser={false}>
                <T.Message $isUser={false}>... 입력중</T.Message>
            </T.MsgWrapper>
        )}
        </T.ChatWrapper>
        
        <T.SendWrapper>
            <T.SendInput
                placeholder="메시지를 입력해주세요"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleEnter}
            />
            <T.SendBtn onClick={handleClick} disabled={isLoading}>
                <img src={`${process.env.PUBLIC_URL}/images/send.svg`} alt="send" />
            </T.SendBtn>
        </T.SendWrapper>
    </T.Container>
  );
};

export default Chatting;