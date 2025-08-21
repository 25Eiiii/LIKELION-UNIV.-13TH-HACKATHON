import * as T from "../../styles/pages/styledChatting"
import { useState, useEffect } from "react"
import useChatbotName from "../../hooks/useChatbotName";
import useChatbotStore from "../../store/useChatbotStore";
import Header from "../../components/Header"
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import ChatMessage from "../../components/ChatMessage";


const Chatting =  () =>  {
  const navigate = useNavigate();

  const { chatbotName, messages, sendMessageToApi, isLoading } = useChatbotStore();

  const [content, setContent] = useState("");
  const [senderId, setSenderId] = useState("");

  const [authToken, setAuthToken] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
        setAuthToken(token);
    }
  }, [])

  // 비로그인 사용자를 위해 세션 아이디 한 번만 생성
  useEffect(() => {
    let storedId = sessionStorage.getItem("senderId");
    if (!storedId) {
        storedId = uuidv4();
        sessionStorage.setItem("senderId", storedId);
    }
    setSenderId(storedId);
  }, []);

  // API 호출
  const handleSendMessage = (messageText) => {
    const authToken = localStorage.getItem('accessToken');
    if (messageText.trim() && !isLoading) {
        sendMessageToApi(messageText, senderId, authToken);
    }
  };

  // 메세지 입력 엔터 키
  const handleEnter = (e) => {
    if (e.key === "Enter" && content.trim() && !isLoading) {
        handleSendMessage(content);
        setContent("");
    }
  };

  // 전송 버튼 키
  const handleClick = () => {
    if (content.trim() && !isLoading) {
        handleSendMessage(content);
      setContent("");
    }
  };
  
  // 현재 날짜
  const today = new Date()
  const formatDate = `${today.getFullYear()}.${today.getMonth()+1}.${today.getDate()}`

  return (
    <T.Container>
        <Header title={chatbotName}>
        </Header>
        <T.Date>{formatDate}</T.Date>
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
                    }}>성북 문화 행사에 대해서 궁금한 내용을 말씀해 주세요.</span>
                </p>
            </T.GuideInro>
        </T.Guide>
       
        {messages.map((msg, idx) => (
            <ChatMessage
                key={idx}
                message={msg}
                onButtonClick={(payload) => handleSendMessage(payload)}
            />
        ))}
        {isLoading && (
            <T.MsgWrapper $isUser={false}>
                <T.Message $isUser={false}>... 입력중</T.Message>
            </T.MsgWrapper>
        )}
        <T.SendWrapper>
            <T.SendInput
                    placeholder="메시지를 입력해주세요"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={handleEnter}
                >
            </T.SendInput>
            <T.SendBtn onClick={handleClick} disabled={isLoading}>
                <img src={`${process.env.PUBLIC_URL}/images/send.svg`} alt="send" />
            </T.SendBtn>
        </T.SendWrapper>
    </T.Container>
  )

}

export default Chatting;