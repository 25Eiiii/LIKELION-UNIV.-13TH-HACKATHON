import styled from "styled-components";

export const StepWrapper = styled.div`
display: flex;
flex-direction: column;
width:  100%;
align-items: center;
margin-top: 66px;
`

export const StepBar = styled.div`
width: 364px;
height: 5px;
flex-shrink: 0;
border-radius: 20px;
background: #DCDCDC;
`

export const StepNum = styled.p`
align-self: flex-start;
margin-left: 30px;
margin-top: 5px;
margin-bottom: 0;
`

export const StepBarFill = styled.div`
width: 123px;
height: 5px;
flex-shrink: 0;
border-radius: 20px;
background: #282F56;
`

export const Step2BarFill = styled.div`
width: 246px;
height: 5px;
flex-shrink: 0;
border-radius: 20px;
background: #282F56;
`

export const TextWrapper = styled.div`
display: flex;
flex-direction: column;
width: 400px;
justify-content: flex-start;
margin-left: 30px;
`

export const TextTitle = styled.p`
color: #383838;
font-family: Pretendard;
font-size: 23px;
font-style: normal;
font-weight: 600;
line-height: 32px; /* 139.13% */
`

export const TextExplain = styled.p`
color: #383838;
font-family: Pretendard;
font-size: 16px;
font-style: normal;
font-weight: 400;
line-height: 20px; /* 125% */
span {
color: #2F3F78;
font-weight: 700;
}
`

export const InterestsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: flex-start;
  margin-top: 15px;
  margin-left: 20px;
`

export const InterestItem = styled.div`
height: 34px;
flex-shrink: 0;
box-sizing: border-box;
padding: 0px 24px;
border-radius: 20px;
border: 1.5px solid #A8A8A8;
background: ${(props) => (props.isSelected) ? "#282F56" : "rgba(255, 255, 255, 1)"};
display: flex;
align-items: center;
text-align: center;
color: ${(props) => (props.isSelected) ? "#fff" : "#484848"};
text-align: center;
font-family: Pretendard;
font-size: 17px;
font-style: normal;
font-weight: 500;
line-height: normal;
cursor: pointer;
`

export const TogetherWrapper = styled.div`
display: flex;
flex-direction: column;
gap: 12px;
justify-content: flex-start;
margin-top: 15px;
margin-left: 40px;
align-items: flex-start;
width: 100%;
`

export const TogetherItem = styled.div`
height: 34px;
flex-shrink: 0;
box-sizing: border-box;
padding: 0px 35px;
border-radius: 20px;
border: 1.5px solid #A8A8A8;
background: ${(props) => (props.isSelected) ? "#282F56" : "rgba(255, 255, 255, 1)"};
display: flex;
align-items: center;
text-align: center;
color: ${(props) => (props.isSelected) ? "#fff" : "#484848"};
text-align: center;
font-family: Pretendard;
font-size: 17px;
font-style: normal;
font-weight: 500;
line-height: normal;
cursor: pointer;
justify-content: flex-start;
display: flex;
`