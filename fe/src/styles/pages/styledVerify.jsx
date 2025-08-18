import styled from "styled-components";

export const InnerWrapper = styled.div`
width: 428px;
display: flex;
flex-direction: column;
align-items: center;
`;

export const ChatBot = styled.img`
margin-top: 74px;
`;

export const Bubble = styled.div`
margin-top: 20px;
background: #FFF;
border-radius: 37px;
border: 2px solid #60C795;
width: 266px;
height: 70.942px;
color: #3F3F3F;
text-align: center;
font-family: Pretendard;
font-size: 18px;
font-style: normal;
font-weight: 600;
line-height: 23px; /* 127.778% */
display: flex;
align-items: center;
justify-content: center;
position: relative;
margin-bottom: 30px;
&::after{
  content: "";
  position: absolute;
  left: 50%;
  top: -8px;                         
  transform: translateX(-50%) rotate(45deg);
  width: 12px;                       
  height: 12px;
  background: #fff;                   
  border: 2px solid #60C795;        
  border-right: none;                
  border-bottom: none;
  border-top-left-radius: 4px;
}
`;

export const VerifyBox = styled.div`
width: 260px;
height: 78px;
flex-shrink: 0;
border-radius: 37px;
border: 1.5px solid #60C795;
background: #60C795;
display: flex;
align-items:center;
justify-content: center;
gap: 17px;
`;

export const BoxText = styled.div`
color: #FFF;
font-family: Pretendard;
font-size: 20px;
font-style: normal;
font-weight: 400;
line-height: normal;
`;

export const AlarmText = styled.div`
color: #9D9D9D;
text-align: center;
font-family: Pretendard;
font-size: 11px;
font-style: normal;
font-weight: 500;
line-height: normal;
display: flex;
gap: 5px;
margin-top: 5px;
`;

export const Verified = styled.div`
margin-top: 42px;
`;

export const Text = styled.div`
color: #3F3F3F;
font-family: Pretendard;
font-size: 18px;
font-style: normal;
font-weight: 500;
line-height: normal;
margin-bottom: 12px;
`;

export const VerifiedBox = styled.div`
width: 373px;
height: 139px;
flex-shrink: 0;
border-radius: 8px;
border: 2px solid #C0C0C0;
display: flex;
gap: 19px;
align-items: center;
margin-bottom: 11px;
`;

export const Img = styled.img`
width: 76.393px;
height: 104.321px;
flex-shrink: 0;
border-radius: 6px;
margin-left: 19px;
`;

export const Title = styled.div`
color: #353535;
font-family: Pretendard;
font-size: 17px;
font-style: normal;
font-weight: 600;
line-height: normal;
display: -webkit-box;
-webkit-line-clamp: 2;  
-webkit-box-orient: vertical;
overflow: hidden;
text-overflow: ellipsis;
`;

export const Date = styled.div`
color: #404040;
font-family: Pretendard;
font-size: 13px;
font-style: normal;
font-weight: 400;
line-height: normal;
`;

export const Place = styled.div`
color: #848484;
font-family: Pretendard;
font-size: 13px;
font-style: normal;
font-weight: 400;
line-height: normal;
margin-bottom: 20px;
`;

export const Info = styled.div`
display: flex;
flex-direction: column;
gap: 6px;
`;

export const Tag = styled.div`
width: 78.036px;
height: 22.179px;
flex-shrink: 0;
border-radius: 8px;
border: 1px solid #BCBCBC;
color: #9B9B9B;
font-family: Pretendard;
font-size: 12px;
font-style: normal;
font-weight: 500;
line-height: normal;
text-align: center;
margin-top: 90px;
margin-right: 10px;
`;

export const Box = styled.div`
height: 40px;
`;