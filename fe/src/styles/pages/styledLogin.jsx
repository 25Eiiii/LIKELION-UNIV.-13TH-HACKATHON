import styled from "styled-components";

export const InnerWrapper = styled.div`
width: 428px;
min-height: 926px;
background: linear-gradient(180deg, #FFF 0%, #F0FFF8 100%), #FFF;
z-index: 1;
display: flex;
align-items: center;
flex-direction: column;
`;

export const BackGround = styled.div`
position: absolute;
z-index: -1;
margin-top: 68px;
`;

export const Logo = styled.div`
display: flex;
justify-content: center;
align-items: center;
margin-top: 154px;
`;

export const Id = styled.input`
width: 386px;
height: 55px;
border-radius: 8px;
border: 2px solid #D9D9D9;
color: #6E6E6E;
font-family: Pretendard;
font-size: 17px;
font-style: normal;
font-weight: 400;
line-height: normal;
text-align: center;
outline: none;
margin-top: 72px;
margin-bottom: 14px;
`;

export const Password = styled.input`
width: 386px;
height: 55px;
border-radius: 8px;
border: 2px solid #D9D9D9;
color: #6E6E6E;
font-family: Pretendard;
font-size: 17px;
font-style: normal;
font-weight: 400;
line-height: normal;
text-align: center;
outline: none;
margin-bottom: 7px;

`;

export const Login = styled.div`
width: 386px;
height: 55px;
flex-shrink: 0;
background: #464D78;
color: #FFF;
font-family: Pretendard;
font-size: 17px;
font-style: normal;
font-weight: 500;
line-height: normal;
display: flex;
align-items: center;
justify-content: center;
border-radius: 8px;
border: none;
margin-bottom: 14px;
margin-top: 10px;
cursor: pointer;
`;

export const SignUp = styled.div`
width: 66px;
height: 19px;
color: #6E6E6E;
text-align: center;
font-family: Pretendard;
font-size: 17px;
font-style: normal;
font-weight: 500;
line-height: normal;
cursor: pointer;
`;

export const Error = styled.div`
width: 200px;
height: 13px;
color: #F93E3E;
font-family: Pretendard;
font-size: 11px;
font-style: normal;
font-weight: 300;
line-height: normal;
margin-left: 23px;

`;