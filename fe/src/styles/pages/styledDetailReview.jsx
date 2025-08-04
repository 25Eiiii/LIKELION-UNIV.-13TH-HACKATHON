import styled from "styled-components";

export const InnerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const Header = styled.div`
  position: relative;
  width: 100%;
`;

export const CloudyBox = styled.div`
  position: absolute;
  width: 428px;
  height: 399px;
  flex-shrink: 0;
  opacity: 0.7;
  background: linear-gradient(
    178deg,
    rgba(255, 255, 255, 0) 1.25%,
    #fff 56.07%
  );
  bottom: 0;
`;

export const WhiteContainer = styled.div`
  position: relative;
  width: 428px;
  min-height: 700px;
  border-top-left-radius: 31px;
  border-top-right-radius: 31px;
  background: #fff;
  box-shadow: 0 1px 12px 0 rgba(0, 0, 0, 0.13);
  margin-top: -35px;
  padding-bottom: 80px;
`;

export const TextBox = styled.div`
  position: absolute;
  width: 428px;
  height: 399px;
  flex-shrink: 0;
  bottom: 0;
`;

export const NameBox = styled.div`
  margin-left: 14px;
  margin-top: 215px;
  display: flex;
  align-items: center;
  gap: 15px;
`;

export const Name = styled.div`
  color: #14284d;
  font-family: Pretendard;
  font-size: 25px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
`;

export const Type = styled.div`
  width: 83px;
  height: 22px;
  flex-shrink: 0;
  border-radius: 12.5px;
  background: #282f56;
  color: #fff;
  font-family: Pretendard;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  text-align: center;
`;

export const Explain = styled.div`
  margin-top: 20px;
  margin-left: 14px;
  width: 356px;
  height: 65px;
  color: #14284d;
  font-family: Pretendard;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
`;

export const Line = styled.div`
  width: 438px;
  height: 1px;
  flex-shrink: 0;
  background: #ddd;
  margin-bottom:55px;
`;

export const Heart = styled.img`
  margin-left: 360px;
`;

export const Share = styled.img`
  margin-right: 14px;
  padding-left: 10px;
`;

export const Tab = styled.div`
  display: flex;
  align-items: center;
  gap: 35px;
  margin-top: 38px;
  margin-left: 41px;
`;

export const EventInfo = styled.div`
width: 75px;
height: 30px;
color: #626262;
font-family: Pretendard;
font-size: 18px;
font-style: normal;
font-weight: 500;
line-height: normal;
`;

export const MiniLine = styled.div`
  width: 75px;
  height: 1px;
  flex-shrink: 0;
  background: #2f3f78;
  margin-top: 4px;
`;

export const Review = styled.div`
width: 75px;
  height: 30px;
color: #2F3F78;
font-family: Pretendard;
font-size: 18px;
font-style: normal;
font-weight: 600;
line-height: normal;
`;

export const ReviewBox = styled.div`
display: flex;
margin-left: 8px;
margin-bottom: 16px;
`;

export const ReviewGrayBox = styled.div`
width: 355px;
min-height: 126px;
height: auto;
flex-shrink: 0;
border-radius: 0 7px 16px 7px;
background: #F3F3F3;
margin-left:9px;
padding-bottom:10px;
`;

export const UserInfoBox = styled.div`
display: flex;
align-items:center;
margin-top: 9px;
margin-left: 16px;
`;

export const Nickname = styled.div`
width: 47px;
height: 14px;
flex-shrink: 0;
color: #545454;
font-family: Pretendard;
font-size: 15px;
font-style: normal;
font-weight: 400;
line-height: normal;
margin-bottom: 10px;
`;

export const Level = styled.div`
width: 109px;
height: 14px;
flex-shrink: 0;
color: #707070;
font-family: Pretendard;
font-size: 10px;
font-style: normal;
font-weight: 400;
line-height: normal;
margin-left: 10px;
`;

export const Date = styled.div`
width:60px;
height: 14px;
color: #707070;
font-family: Pretendard;
font-size: 10px;
font-style: normal;
font-weight: 400;
line-height: normal;
margin-left: 89px;
`;

export const UserImage = styled.div`
margin-left: 16px;
display: flex;
gap: 19px;
`;

export const UserText = styled.div`
width:322px;
height: auto;
color: #707070;
font-family: Pretendard;
font-size: 15px;
font-style: normal;
font-weight: 400;
line-height: normal;
margin-left: 16px;
`;