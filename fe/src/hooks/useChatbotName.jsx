import { useState, useEffect } from "react";

const useChatbotName = () => {
  const [name, setName] = useState("");

  useEffect(() => {
    const storedName = localStorage.getItem("chatbotName");
    if (storedName) {
      setName(storedName);
    }
  }, []);

  return name;
};

export default useChatbotName;