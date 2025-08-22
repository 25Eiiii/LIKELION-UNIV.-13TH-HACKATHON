import { Container } from "../../styles/common/styledContainer";
import * as C from "../../styles/pages/styledChatbotIntro";


const ChatbotIntro = ({ message, image }) => (
    <Container>
        <C.Welcome>
            <img src={`${process.env.PUBLIC_URL}/images/${image}`} alt="챗봇" />
            <p>{message}</p>
        </C.Welcome>
    </Container>
);
 
export default ChatbotIntro;