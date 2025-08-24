import * as T from "../styles/pages/styledChatting"
import Markdown from 'markdown-to-jsx';
import styled from "styled-components";

const ChatMessage = ({ message, onButtonClick }) => {
    // 사용자 메시지인지
    const isUser = message.sender == "user";
    // 버튼 있는지 
    const hasButtons = message.buttons && message.buttons.length >0;
    const customInfo = message.custom?.payload;

    return (
        <T.MsgWrapper $isUser={isUser}>
            <T.Message $isUser={isUser}>
                {/* Markdown 텍스트 렌더링 */}
                <Markdown>
                    {message.text}
                </Markdown>
                {customInfo?.hmpg_addr && (
                    <Link href={customInfo.hmpg_addr} target="_blank" rel="noopener noreferrer">
                        홈페이지 바로가기
                    </Link>
                )}
            </T.Message>
            {/* 챗봇 메시지에 버튼 있을 경우 렌더링 */}
            {hasButtons && (
                <T.ButtonsWrapper>
                    {message.buttons.map((button, index) => (
                        <T.Button
                            key={index}
                            onClick={() => onButtonClick(button.payload)}
                        >
                            {button.title}
                        </T.Button>
                ))}

                </T.ButtonsWrapper>
            )}
        </T.MsgWrapper>
    )
}

export default ChatMessage;

export const Link = styled.a`
color: #007bff;
text-decoration: none; 
&:hover { text-decoration: underline; } 
display: block;
margin-top: 5px;
`