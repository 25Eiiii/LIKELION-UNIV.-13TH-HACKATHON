import styled from "styled-components";

export const Container = styled.div`
  position: fixed; 
  bottom: 50px;
  left: 50%;
  transform: translateX(-50%); // 
  width: 428px;
  height: 926px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #FFFFFF;
  border-radius: 30px;
  z-index: 999; // 
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
&::-webkit-scrollbar {
display: none;
`;

