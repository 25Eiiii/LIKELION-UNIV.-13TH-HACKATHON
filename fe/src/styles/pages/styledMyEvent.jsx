import styled from "styled-components"

export const Header = styled.div`
margin-top: 50px;
display: flex;
width: 80%;
justify-content: flex-start;
`

export const LvWrapper = styled.div`

`
export const LvName = styled.div`
width: 100%;
color: #FFF;
font-family: Pretendard;
font-size: 20px;
font-style: normal;
font-weight: 600;
line-height: normal;
`
export const Lv  = styled.div`
color: #FFF;
font-family: Pretendard;
font-size: 26px;
font-style: normal;
font-weight: 700;
line-height: normal;
`
export const LvBar = styled.div`

`
export const NextLv = styled.p`
color: #FFF;
font-family: Pretendard;
font-size: 14px;
font-style: normal;
font-weight: 500;
line-height: normal;
justify-self: flex-end;
margin-right: 20px;
`
export const Wrapper = styled.div`
display: flex;
flex-direction: column;
width: 428px;
height: 100%;
flex-shrink: 0;
background: #FFF;
margin-top: 30px;
border-radius: 23px  23px 0px 0px;
`

export const Tab = styled.div`
display:  flex;
color: #858585;
font-family: Pretendard;
font-size: 12px;
font-style: normal;
font-weight: 400;
line-height: normal;
justify-content: space-between;
padding: 40px 25px;
`
export const Item =styled.div`
display: flex;
flex-direction: column;
align-items: center;
`
export const Circle = styled.circle`
width: 53px;
height: 53px;
flex-shrink: 0;
display: flex;
align-items: center;
justify-content: center;
border-radius: 50px;
`

export const Tab2 = styled.div`
  display: flex;
  justify-content: space-around;
  border-bottom: 1px solid #ddd;
`
export const Tab2Item = styled.div`
  position: relative;
  padding: 8px 0;
  font-size: 16px;
  font-weight: ${(props) => (props.isActive ? "500" : "400")};
  color: ${(props) => (props.isActive ? "#14284D" : "#616161")};
  cursor: pointer;
  flex: 1;
  text-align: center;

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: ${(props) => (props.isActive ? "73px" : "0")}; // 💡 더 짧게!
    height: 2px;
    background-color: #1F2D6A;
    transition: all 0.2s ease;
  }
`;


