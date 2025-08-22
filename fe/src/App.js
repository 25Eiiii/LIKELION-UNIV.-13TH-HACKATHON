import './App.css';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home"
import ChatbotIntroWrapper from './pages/chatbot/ChatbotIntroWrapper';
import ChatbotStart from './pages/chatbot/ChatbotStart';
import Chatbot from './pages/chatbot/Chatbot';
import Chatting from './pages/chatbot/Chatting';
import MyEvent from './pages/mypage/MyEvent';
import DetailInfo from './pages/DetailInfo';
import DetailReview from './pages/DetailReview';
import Step1 from './pages/info/Step1';
import Step2 from './pages/info/Step2';
import Step3 from './pages/info/Step3';
import Step4 from './pages/info/Step4';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import Category from './pages/Category';
import Search from './pages/Search';
import Likes from './pages/Likes';
import Survey from './pages/Survey';
import Verify from './pages/Verify';
import WriteReview from "./pages/mypage/WriteReview";
import Splash from './pages/Splash';
import { useEffect } from 'react';
import useAuthStore from './store/useAuthStore';
import useChatbotStore from './store/useChatbotStore';

function AuthStateChangeHandler() {
  const user = useAuthStore((s) => s.user);
  const clearChatHistory = useChatbotStore((s) => s.clearChatHistory);

  useEffect(() => {
    console.log("유저 변경 감지됨. 대화 내역 초기화함.");
    clearChatHistory();
  }, [user, clearChatHistory]);

  return null;
}

function App() {

  return (
    <BrowserRouter>
    <AuthStateChangeHandler />
      <Routes>
        <Route path="/home" element={<Home />}></Route>
        <Route path='/chatbot-intro' element={<ChatbotIntroWrapper />}></Route>
        <Route path='/chatbot-start' element={<ChatbotStart />}></Route>
        <Route path='/chatbot' element={<Chatbot />}></Route>
        <Route path='/chatting' element={<Chatting />}></Route>
        <Route path='/mypage-myevent' element={<MyEvent />}></Route>
        <Route path="/detailInfo" element={<DetailInfo/>}/>
        <Route path="/detailInfo/:id" element={<DetailInfo/>}/>
        <Route path="/detailReview/:id" element={<DetailReview/>}/>
        <Route path="/survey/step1" element={<Step1/>}/>
        <Route path="/survey/step2" element={<Step2/>}/>
        <Route path="/survey/step3" element={<Step3/>}/>
        <Route path="/survey/step4" element={<Step4/>}/>
        <Route path='/signup'element={<SignUp/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/category'element={<Category/>}/>
        <Route path='/search' element={<Search/>}/>
        <Route path='/likes' element={<Likes/>}/>
        <Route path='/survey/:id' element={<Survey/>}/>
        <Route path='/verify' element={<Verify/>}/>
        <Route path="/write-review/:event_id" element={<WriteReview />} />
        <Route path="/" element={<Splash/>}/>
      </Routes>
    </BrowserRouter>
  );
};

export default App;