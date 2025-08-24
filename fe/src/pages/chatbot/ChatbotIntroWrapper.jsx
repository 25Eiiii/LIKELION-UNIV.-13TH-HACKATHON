import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ChatbotIntro from "./ChatbotIntro";
import useAuthStore from "../../store/useAuthStore";

const ChatbotIntroWrapper = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const nickname = useAuthStore((s) => s.nickname);
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (step === 2) { 
        navigate("/chatbot"); 
      } else {
        setStep(step + 1);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [step, navigate]);

  const steps = {
    1: {
      image: "chatbotintro.svg", 
      message: (
        <>
          안녕하세요! 👋 <br />
          문화 가이드 부기입니다.
        </>
      ),
    },
    2: {
      image: "chatbotintro2.svg", 
      message: (
        <>
          {token ? `${nickname}님의` : '회원님의'} 즐거운 문화 생활을 위해 <br />
          <span style={{ color: "#4DB080" }}>맞춤형 문화 활동</span>을 추천해드릴게요!
        </>
      ),
    },
  };
  
  if (!steps[step]) {
    return null;
  }


  return <ChatbotIntro message={steps[step].message} image={steps[step].image} />;
};

export default ChatbotIntroWrapper;