import { useEffect, useState } from "react";
import ChatbotIntro from "./ChatbotIntro";
import ChatbotNameStep from "./ChatbotNameStep";
import useChatbotStore from "../../store/useChatbotStore";
import { useNavigate } from "react-router-dom";

const ChatbotIntroWrapper = () => {
  const [step, setStep] = useState(1);
  const chatbotName = useChatbotStore((state) => state.chatbotName);
  const storedName = localStorage.getItem("chatbotName")
  const navigate = useNavigate();

  useEffect(() => {
    if (chatbotName.trim().length>=1) {
      navigate("/chatbot");
    }
  },[])

  useEffect(() => {
    if (step < 3) {
      const timer = setTimeout(() => setStep(step + 1), 2000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const steps = {
    1: {
      message: (
        <>
          안녕하세요! 👋 <br />
          성북 문화 가이드입니다.
        </>
      ),
    },
    2: {
      message: (
        <>
          효민님의 즐거운 문화 생활을 위해 <br></br>
          <span style={{ color: "#4DB080" }}>맞춤형 문화 활동</span>을 추천해드릴게요!
        </>
      ),
    },
  };

  if (step === 3) return <ChatbotNameStep />;
  return <ChatbotIntro message={steps[step].message} />;
};

export default ChatbotIntroWrapper;
