import styled from "styled-components";

export const Welcome = styled.p`
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  margin-top: 50%;
  display: flex;
  flex-direction: column;
  img {
    margin-bottom: 50px;
  }
`;

export const Highlight = styled.p`
color: #4DB080;
`

export const ButtonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
`;

export const NameInput = styled.input`
width: 225px;
height: 44px;
flex-shrink: 0;
border-radius: 37px;
border: 3px solid #60C795;
background: #FFF;
text-align: center;
color: #555;
font-family: Pretendard;
font-size: 22px;
font-style: normal;
font-weight: 600;
line-height: normal;
`;

export const CompleteButton = styled.button`
width: 225px;
height: 43px;
flex-shrink: 0;
border-radius: 37px;
background: linear-gradient(90deg, #43D0BB 0%, #60C795 100%);
border: none;
color: #FFF;
font-family: Pretendard;
font-size: 22px;
font-style: normal;
font-weight: 600;
line-height: normal;
`;
