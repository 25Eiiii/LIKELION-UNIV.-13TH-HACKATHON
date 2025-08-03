import styled from "styled-components"

export const Container = styled.div`
background: linear-gradient(180deg, #FFF 0%, #F3FFE6 100%);
position: fixed; 
bottom: 50px;
left: 50%;
transform: translateX(-50%); // 
width: 428px;
height: 926px;
display: flex;
flex-direction: column;
align-items: center;
border-radius: 30px;
z-index: 999; // 
box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
overflow-y: auto;
&::-webkit-scrollbar {
display: none;
`;

export const Header = styled.div`
width: 428px;
height: 59px;
flex-shrink: 0;
background: #60C795;
color: #FFF;
font-family: Pretendard;
font-size: 22px;
font-style: normal;
font-weight: 700;
line-height: normal;
display: flex;
align-items:  center;
justify-content: center;
`

export const Date = styled.div`
color: #5C5C5C;
font-family: Pretendard;
font-size: 15px;
font-style: normal;
font-weight: 400;
line-height: normal;
margin-top: 14px;
`

export const Guide = styled.div`
gap: 5px;
display:  flex;
flex-direction: column;
margin-top: 30px;
width: 100%;
box-sizing: border-box;
padding: 0px 26px;
margin-bottom: 10px;
`

export const GuideImg = styled.div`
    img {
    width: 50px;
    height: 50px;
    flex-shrink: 0;}
`
export const GuideInro = styled.div`
margin-left: 10px;
color: #404040;
font-family: Pretendard;
font-size: 18px;
font-style: normal;
font-weight: 600;
line-height: normal;
    p {
    margin: 0;
    }
`
export const MsgWrapper = styled.div`
width: 90%;
margin-top: 15px;
box-sizing: border-box;
display: flex;
justify-content: ${(props) => (props.$isUser ? "flex-end" : "flex-start")};
`

export const Message = styled.div`
height: 45px;
flex-shrink: 0;
border-radius:13px;
border: 2px solid #D9D9D9;
background: #FFF;
color: #454545;
font-family: Pretendard;
font-size: 15px;
font-style: normal;
font-weight: 500;
line-height: normal;
box-sizing: border-box;
display: flex;
align-items: center;
padding: 0 15px;
border-top-${(props) => (props.$isUser ? "left" : "right")}-radius: 0;
`

export const SendWrapper = styled.div`
width: 428px;
height: 80px;
position: absolute;
bottom: 0;
display: flex;
align-items: center;
justify-content: center;
gap: 10px;
`
export const SendInput = styled.input`
width: 350px;
height: 44px;
flex-shrink: 0;
border-radius: 37px;
background: #fff;
border: none;
box-sizing: border-box;
padding-left: 20px;
color: #858585;
font-family: Pretendard;
font-size: 15px;
font-style: normal;
font-weight: 400;
line-height: normal;
border: 1px solid #60C795;
`
export const SendBtn = styled.button`
border: none;
border-radius: 50px;
width: 44px;
height: 44px;
background: #fff;
border: 1px solid #60C795;
`