import './App.css';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home"
import ChatbotIntroWrapper from './pages/chatbot/ChatbotIntroWrapper';
import ChatbotStart from './pages/chatbot/ChatbotStart';
import Chatbot from './pages/chatbot/Chatbot';
import Chatting from './pages/chatbot/Chatting';
import DetailInfo from './pages/DetailInfo';
import DetailReview from './pages/DetailReview';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import Category from './pages/Category';
import Search from './pages/Search';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/home" element={<Home />}></Route>
        <Route path='/chatbot-intro' element={<ChatbotIntroWrapper />}></Route>
        <Route path='/chatbot-start' element={<ChatbotStart />}></Route>
        <Route path='/chatbot' element={<Chatbot />}></Route>
        <Route path='/chatting' element={<Chatting />}></Route>
        <Route path="/detailInfo/:id" element={<DetailInfo/>}/>
        <Route path="/detailReview" element={<DetailReview/>}/>
        <Route path='/signup'element={<SignUp/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/category'element={<Category/>}/>
        <Route path='/search' element={<Search/>}/>
      </Routes>
    </BrowserRouter>
  );
};

export default App;