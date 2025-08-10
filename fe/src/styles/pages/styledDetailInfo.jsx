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
  padding-bottom: 25px;
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
  min-width: 75px;
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
  position: absolute;
  top: 300px;
  right: 16px;
  padding-left: 3px;
  padding-right: 3px;
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

export const IconBox = styled.div`
position: absolute;
display:flex;
gap: 12px;
top :332px;
right: 16px;
`;
export const Heart = styled.img`
 
`;

export const Share = styled.img`
  
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
  width: 150px;
  height: 19px;
  flex-shrink: 0;
  color: #111;
  font-family: Pretendard;
  font-size: 19px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  margin-left: 27px;
  margin-top: 45px;
  display: flex;
  align-items: center;
`;

export const BasicGrayBox = styled.div`
  width: 403px;
  min-height: 170px;
  height: auto;
  flex-shrink: 0;
  border-radius: 7px;
  background: #FFF;
  margin-left: 15px;
  
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 20px;
`;

export const GrayText = styled.div`
  width: auto;
  white-space: nowrap;
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
  margin-left: 5px;
  overflow:hidden;
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
width: 403px;
max-height: 330px;
flex-shrink: 0;
border-radius: 7px;
border: 1px solid #CFCFCF;
background: #FFF9E5;
margin-left: 15px;
margin-top: 25px;
padding-bottom: 10px;
`;

export const GainPointText = styled.div`
color: #434343;
font-family: Pretendard;
font-size: 16px;
font-style: normal;
font-weight: 500;
line-height: normal;
margin-left: 19px;
margin-top: 16px;
margin-bottom: 11px;
`;

export const GuidePoint = styled.div`

`;

export const Guide = styled.div`
color: #525252;
font-family: Pretendard;
font-size: 14px;
font-style: normal;
font-weight: 500;
line-height: 25px; 
display: flex;
align-items: center;
margin-left: 17px;

`;

export const PointLine = styled.div`
width: 402px;
height: 1px;
background: #D9D9D9;
margin-top: 11px;
`;

export const PointStandard = styled.div`
color: #434343;
font-family: Pretendard;
font-size: 15px;
font-style: normal;
font-weight: 500;
line-height: normal;
margin-left: 16px;
margin-top: 10px;
`;


export const PointDetailBox = styled.div`
display: flex;
margin-top: 14px;
`;

export const BasicBox = styled.div`
display: flex;
flex-direction: column;
align-items: center;
margin-left: 37px;
`;

export const Title = styled.div`
color: #6E6E6E;
font-family: Pretendard;
font-size: 16px;
font-style: normal;
font-weight: 500;
line-height: normal;
margin-bottom:14px;
`;

export const Text = styled.div`
color: #6E6E6E;
text-align: center;
font-family: Pretendard;
font-size: 13px;
font-style: normal;
font-weight: 500;
line-height: normal;
margin-bottom: 12px;
`;

export const PointDetailLine = styled.div`
width: 1px;
height: 89px;
background: #ABABAB;
margin-left:53px;
margin-right: 30px;
`;

export const AddBox = styled.div`
display: flex;
flex-direction: column;
align-items: center;

`;

export const WhiteAlarm = styled.div`
width: 338px;
height: 26px;
flex-shrink: 0;
border-radius: 32.5px;
background: #FFF;
color: #484848;
font-family: Pretendard;
font-size: 12px;
font-style: normal;
font-weight: 500;
line-height: normal;
display: flex;
align-items: center;
margin-left:28px;
padding-right: 10px;
margin-bottom: 10px;
`;

export const DetailInfo = styled.div`
color: #111;
font-family: Pretendard;
font-size: 18px;
font-style: normal;
font-weight: 500;
line-height: normal;
margin-left: 27px;
margin-top: 21px;
`;

export const DetailBox = styled.div`
display: flex;
flex-direction: column;
gap: 20px;
margin-left: 13px;
width: 403px;
border-radius: 7px;
background: #FFF;
min-height: 126px;
height: auto;
padding-top: 15px;
padding-bottom: 10px;
overflow: hidden;
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

export const QrBox = styled.div`
display: flex;
align-items: center;
justify-content: center;
color: #5A5A5A;
font-family: Pretendard;
font-size: 15px;
font-style: normal;
font-weight: 600;
line-height: normal;
width: 231px;
height: 57px;
flex-shrink: 0;
border-radius: 32.5px;
border: 1px solid #AFAFAF;
background: #FFF;
margin-top:35px;
margin-left: 186px;
`;