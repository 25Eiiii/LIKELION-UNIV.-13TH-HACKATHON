import * as T from "../../styles/pages/styledChatting"
import { useState, useEffect } from "react"
import useChatbotName from "../../hooks/useChatbotName";
import useChatbotStore from "../../store/useChatbotStore";
import Header from "../../components/Header"


const Chatting =  () =>  {
  const chatbotName = useChatbotStore((state) => state.chatbotName)
  const [content, setContent] = useState("");
  const  messages = useChatbotStore((state) => state.messages);
  const { addMessage } = useChatbotStore();
  
  // 현재 날짜
  const today = new Date()
  const formatDate = `${today.getFullYear()}.${today.getMonth()+1}.${today.getDate()}`
  
  const handleEnter = (e) => {
    if (e.key == "Enter") {
        addMessage({ sender: "user", text: content })
        setContent("");
    }
  }

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
        <>
        {messages.map((msg, idx) => (
            <T.MsgWrapper key={idx} $isUser={msg.sender === "user"}>
                <T.Message>{msg.text}</T.Message>
            </T.MsgWrapper>
        ))}

          
        </>
        <T.SendWrapper>
            <T.SendInput
                    placeholder="메시지를 입력해주세요"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={handleEnter}
                >
            </T.SendInput>
            <T.SendBtn>
            </T.SendBtn>
        </T.SendWrapper>
    </T.Container>
  )

}

export default Chatting;