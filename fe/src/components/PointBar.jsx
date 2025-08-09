import styled from "styled-components"
import { useState } from "react"
import { NextLv } from "../styles/pages/styledMyEvent";

const MAX_POINT = 3000;

const PointBar = ({ currentPoint }) => {
  const progress = Math.min((currentPoint / MAX_POINT) * 100, 100);
  
  return (
    <ProgressWrapper>
        <BarBackground>
            <BarFill style={{ width: `${progress}%` }}></BarFill>
        </BarBackground>
        <NextLv>다음 레벨까지 {MAX_POINT-currentPoint}P</NextLv>
        <CurrentPoint>{currentPoint}
            <Point>P</Point>
        </CurrentPoint>
    </ProgressWrapper>
  )
}

export default PointBar;

const ProgressWrapper = styled.div`
  width: 362px;
  margin-top: 10px;
`;

const BarBackground = styled.div`
  width: 100%;
  height: 7px;
  background-color: #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
`;

const BarFill = styled.div`
  height: 100%;
  background-color: #60C795;
  transition: width 0.4s ease;
`;
const CurrentPoint = styled.div`
color: #60C795;
font-family: Pretendard;
font-size: 25px;
font-style: normal;
font-weight: 600;
line-height: normal;
display: flex;
align-items: center;
gap: 7px;
`
const Point = styled.div`
width: 23px;
height: 23px;
flex-shrink: 0;
color: #FFF;
font-family: Pretendard;
font-size: 20px;
font-style: normal;
font-weight: 600;
line-height: normal;
background: rgba(96, 199, 149, 1);
border-radius: 50px;
display: flex;
align-items: center;
justify-content: center;
margin-top: 4px;
`