import { Container } from "../../styles/common/styledContainer";
import * as C from "../../styles/pages/styledChatbot"

const ChatbotIntro = ({ message }) => (
    <Container>
        <C.Welcome>
        <img src={`${process.env.PUBLIC_URL}/images/chatbotintro.svg`} alt="챗봇" />
            <p>{message}</p>
        </C.Welcome>
    </Container>
  );
  
  export default ChatbotIntro;