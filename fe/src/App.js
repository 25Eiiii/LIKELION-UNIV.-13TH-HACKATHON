import './App.css';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home"
import ChatbotIntroWrapper from './pages/chatbot/ChatbotIntroWrapper';
import ChatbotStart from './pages/chatbot/ChatbotStart';
import Chatbot from './pages/chatbot/Chatbot';
import Chatting from './pages/chatbot/Chatting';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/home" element={<Home />}></Route>
        <Route path='/chatbot-intro' element={<ChatbotIntroWrapper />}></Route>
        <Route path='/chatbot-start' element={<ChatbotStart />}></Route>
        <Route path='/chatbot' element={<Chatbot />}></Route>
        <Route path='/chatting' element={<Chatting />}></Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;