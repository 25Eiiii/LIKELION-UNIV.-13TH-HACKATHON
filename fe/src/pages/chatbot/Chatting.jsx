import * as T from "../../styles/pages/styledChatting"
import { useState, useEffect } from "react"
import useChatbotName from "../../hooks/useChatbotName";


const Chatting =  () =>  {
  const name = useChatbotName();
  const [content, setContent] = useState("");
  return (
    <T.Container>
        <T.Header>
            {name}
        </T.Header>
        <T.Date>2025.07.27</T.Date>
        <T.Guide>
            <T.GuideImg>
                <img src={`${process.env.PUBLIC_URL}/images/chatbot.svg`} alt="챗봇" />
            </T.GuideImg>
            <T.GuideInro>
                <p>
                안녕하세요 ! 성북 가이드 <span style={{ color: "#60C795" }}>{name}</span> 입니다. <br />
                <span style={{ 
                    color: "#3F3F3",
                    fontSize: "14px",
                    fontWeight: "400"
                    }}>성북 문화 행사에 대해서 궁금한 내용을 말씀해 주세요.</span>
                </p>
            </T.GuideInro>
        </T.Guide>
        <T.SendWrapper>
            <T.SendInput
                    placeholder="메시지를 입력해주세요"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                >
            </T.SendInput>
            <T.SendBtn>
            </T.SendBtn>
        </T.SendWrapper>
    </T.Container>
  )

}

export default Chatting;