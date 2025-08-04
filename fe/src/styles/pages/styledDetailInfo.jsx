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
  padding-bottom: 40px;
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
`;

export const RecommendBox = styled.div`
  width: 428px;
  height: 301px;
  background: #282f56;
  padding-bottom: 70px;
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
  color: #2f3f78;
  font-family: Pretendard;
  font-size: 18px;
  font-style: normal;
  font-weight: 600;
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
  color: #5d5d5d;
  font-family: Pretendard;
  font-size: 18px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
`;

export const BasicInfo = styled.div`
  width: 75px;
  height: 19px;
  flex-shrink: 0;
  color: #111;
  font-family: Pretendard;
  font-size: 19px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  margin-left: 15px;
  margin-top: 28px;
`;

export const BasicGrayBox = styled.div`
  width: 403px;
  height: 193px;
  flex-shrink: 0;
  border-radius: 7px;
  background: #f3f3f3;
  margin-left: 15px;
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 22px;
`;

export const GrayText = styled.div`
  width: auto;
  height: 19px;
  color: #a0a0a0;
  font-family: Pretendard;
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: 19px;
`;

export const BlackText = styled.div`
  color: #575757;
  font-family: Pretendard;
  font-size: 15px;
  font-style: normal;
  font-weight: 500;
  line-height: 19px;
  padding: 0;
  margin-left: 3px;
`;

export const InfoTextBox = styled.div`
  display: flex;
  align-items: center;
  margin-left: 13px;
`;

export const Benefit = styled.div`
  color: #111;
  font-family: Pretendard;
  font-size: 18px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  margin-left: 15px;
  margin-top: 19px;
`;

export const CouponBox = styled.div`
  width: 403px;
  height: 49px;
  flex-shrink: 0;
  border-radius: 5px;
  border: 1px solid #ababab;
  background: #fff;
  margin-left: 15px;
  margin-top: 13px;
`;

export const CouponTitle = styled.div`
  width: 50px;
  height: 19px;
  color: #111;
  font-family: Pretendard;
  font-size: 18px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  margin-left: 22px;
  margin-top: 10px;
`;

export const CouponList = styled.div`
  width: 403px;
  height: auto;
  flex-shrink: 0;
  border-radius: 5px;
  border: 1px solid #ababab;
  background: #fff;
  margin-left: 15px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const CouponItem = styled.div`
  color: #838383;
  font-family: Pretendard;
  font-size: 15px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 49px;
  padding-left: 15px;
`;

export const CouponLine = styled.div`
width: 402px;
height: 1px;
flex-shrink: 0;
background: #ABABAB;
`;

export const PointBox = styled.div`
width: 191px;
height: 51px;
flex-shrink: 0;
border-radius: 5px;
border: 1px solid #ABABAB;
background: #FFF;
margin-left: 15px;
margin-top: 23px;
display: flex;
align-items: center;
gap: 20px;
`;

export const PointTitle = styled.div`
width:50px;
height: 19px;
color: #111;
font-family: Pretendard;
font-size: 18px;
font-style: normal;
font-weight: 500;
line-height: normal;
display:flex;
justify-content: center;
align-items: center;
margin-left: 20px;
`;

export const PointLine = styled.div`
width: 1px;
height: 51px;
background: #ABABAB;
margin-left: 5px;
`;

export const Point = styled.div`
width:50px;
height: 19px;
color: #282F56;
font-family: Pretendard;
font-size: 18px;
font-style: normal;
font-weight: 600;
line-height: normal;
display:flex;
justify-content: center;
align-items: center;
margin-left: 5px;
`;

export const DetailInfo = styled.div`
color: #111;
font-family: Pretendard;
font-size: 18px;
font-style: normal;
font-weight: 500;
line-height: normal;
margin-left: 15px;
margin-top: 21px;
margin-bottom: 12px;
`;

export const DetailBox = styled.div`
display: flex;
flex-direction: column;
gap: 20px;
margin-left: 13px;
width: 403px;
border-radius: 7px;
background: #F3F3F3;
height: 126px;
padding-top: 28px;
`;

export const RecText = styled.div`
margin-left: 15px;
margin-top: 19px;
color: #FFF;
font-family: Pretendard;
font-size: 20px;
font-style: normal;
font-weight: 600;
line-height: normal;
`;

export const AlarmText=styled.div`
color: #FFF;
font-family: Pretendard;
font-size: 13px;
font-style: normal;
font-weight: 500;
line-height: normal;
margin-left: 15px;
display: flex;
align-items: center;
margin-top: 20px;
`;

export const RecommendList = styled.div`
display: flex;
align-items: center;
margin-left: 15px;
margin-top: 10px;
gap: 20px;
overflow-x: auto;
width: 428px;
&::-webkit-scrollbar {
    display: none; 
}
`;

export const StoreBox= styled.div`
width: 200px;
`;

export const StoreText = styled.div`
color: #FFF;
font-family: Pretendard;
font-size: 15px;
font-style: normal;
font-weight: 500;
line-height: normal;
display: flex;
align-items:center;
white-space: nowrap;
`;