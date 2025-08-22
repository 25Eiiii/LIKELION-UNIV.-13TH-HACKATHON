import styled from "styled-components"

export const Container = styled.div`
background: linear-gradient(180deg, #FFF 0%, #F0FFF8 100%);
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
export const ChatbotImg = styled.div`
margin-top: 50px;
`

export const ChatbotName = styled.div`
padding: 7px 10px;
height: 19px;
min-width: 50px;
flex-shrink: 0;
border-radius: 44px;
background: #3B4268;
color: #FFF;
font-family: Pretendard;
font-size: 13px;
font-style: normal;
font-weight: 600;
line-height: normal;
display: flex;
align-items: center;
justify-content: center;
`
export const QuestionWrapper = styled.div`
width: 354px;
height: 195px;
flex-shrink: 0;
border-radius: 44px;
background: #60C795;
margin-top: 30px;
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
`
export const QuestionTitle = styled.div`
color: #FFF;
font-family: Pretendard;
font-size: 19px;
font-style: normal;
font-weight: 600;
line-height: normal;
`
export const QuestionList = styled.div`
margin-top: 6px;
gap: 10px;
display: flex;
flex-direction: column;
`
export const Question = styled.div`
height: 36px;
flex-shrink: 0;
border-radius: 37px;
background: #FFF;
color: #6B6B6B;
font-family: Pretendard;
font-size: 15px;
font-style: normal;
font-weight: 500;
line-height: normal;
display: flex;
align-items:  center;
padding-left: 15px;
padding-right: 70px;
cursor: pointer;
`

export const Recommend = styled.div`
display: flex;
flex-direction: column;
justify-content: flex-start;
margin-left: 80px;
`

export const RecText = styled.p`
width: 370px;
height: 99px;
flex-shrink: 0;
color: #282F56;
font-family: Pretendard;
font-size: 20px;
font-style: normal;
font-weight: 500;
line-height: normal;
margin-bottom: 40px;
`

export const RecList = styled.div`
display: flex;
gap: 15px;
`
export const SendWrapper = styled.div`
width: 428px;
height: 80px;
flex-shrink: 0;
border-top-left-radius: 23px;
border-top-right-radius: 23px;
background: #282F56;
box-shadow: 0 1px 16px 1px rgba(0, 0, 0, 0.10);
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
background: #EFEFEF;
border: none;
box-sizing: border-box;
padding-left: 20px;
color: #858585;
font-family: Pretendard;
font-size: 15px;
font-style: normal;
font-weight: 400;
line-height: normal;
`
export const SendBtn = styled.button`
border: none;
border-radius: 50px;
width: 44px;
height: 44px;
img {
width: 22px;
height: 22px;
}
display: flex;
justify-content: center;
align-items: center;
`