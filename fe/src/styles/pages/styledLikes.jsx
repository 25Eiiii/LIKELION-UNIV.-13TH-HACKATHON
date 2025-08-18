import styled from "styled-components";

export const Header = styled.div`
width: 428px;
height: 41px;
background: #282F56;
padding-top: 43px
`;

export const InnerWrapper = styled.div`
width: 428px;
min-height: 926px;

`;

export const Back = styled.div`
width: 15px;
height: 9px;
margin-left: 38px;

`;

export const HeaderTitle = styled.div`
width: 150px;
height: 22px;
flex-shrink: 0;
color: #FFF;
font-family: Pretendard;
font-size: 20px;
font-style: normal;
font-weight: 600;
line-height: normal;
text-align: center;
margin-left: 140px;
margin-top: -15px;
`;

export const Text = styled.div`
width: 370px;
height: 42px;
flex-shrink: 0;
color: #353535;
font-family: Pretendard;
font-size: 20px;
font-style: normal;
font-weight: 600;
line-height: 35px; /* 175% */
margin-bottom: 70px;
margin-left: 24px;
`;

export const DataBox = styled.div`
display: flex;
margin-bottom: 30px;
margin-left: 24px;
gap: 40px;
`;

export const Img = styled.img`
width: 93px;
height: 127px;
flex-shrink: 0;
border-radius: 6px;      
`;

export const TextBox = styled.div`
width: 170px;
height: 127px;
diaplay: flex;
flex-direction: column;
`;

export const Title = styled.div`
color: #353535;
font-family: Pretendard;
font-size: 17px;
font-style: normal;
font-weight: 600;
line-height: normal;
margin-bottom: 13px;
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
margin-bottom: 13px;
`;

export const Agency = styled.div`
color: #848484;
font-family: Pretendard;
font-size: 13px;
font-style: normal;
font-weight: 400;
line-height: normal;
display: -webkit-box;
-webkit-line-clamp: 2;  
-webkit-box-orient: vertical;
overflow: hidden;
text-overflow: ellipsis;
`;

export const IconBox = styled.div`
margin-left: 10px;
margin-top:5px;
`;

export const Heart = styled.div`
margin-bottom: 40px;
`;

export const PointIcon = styled.div`
position: relative;
`;

export const Point = styled.div`
width: 70px;
height: 39px;
flex-shrink: 0;
border-radius: 7px;
background: #FFF;
box-shadow: 0 1px 16px 0 rgba(0, 0, 0, 0.16);
color: #2F3F78;
font-family: Pretendard;
font-size: 15px;
font-style: normal;
font-weight: 500;
line-height: normal;
display: flex;
justify-content: center;
align-items: center;
position: absolute;
right: 40px;
`;

export const Box = styled.div`
height: 70px;
`;