import EventCardS from '../../components/EventCardS';
import React from 'react';
import styled from 'styled-components';

const MyCultureLog = () => {
  const logs = [
    {
        title: "스테이 성북",
        date: "2025.08.20 - 2025.08.27",
        location: "성북예술창작터",
        thumbnail: "post2.svg",
    },
    {
        title: "한옥 쉼표, 싱잉볼 테라피",
        date: "2025. 08. 20 - 2025. 08. 27",
        location: "서울 문화 예술 교육 센터",
        thumbnail: "post3.svg",
    },
    {
        title: "한옥 쉼표, 싱잉볼 테라피",
        date: "2025. 08. 20 - 2025. 08. 27",
        location: "서울 문화 예술 교육 센터",
        thumbnail: "post3.svg",
    },
    ];
    
  return (
    <Wrapper>
        {logs.map((log, idx) => (
            <CardGroup key={idx}>
            <EventCardS {...log}/>
            <ReviewBtn>후기 작성하기</ReviewBtn>
            </CardGroup>
        ))}
    </Wrapper>
  )
};

export default MyCultureLog;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px 26px;
`;

const CardGroup = styled.div`
display: flex;
flex-direction: column;
position: relative;
`

export const ReviewBtn = styled.button`
width: 95px;
height: 27px;
flex-shrink: 0;
border-radius: 8px;
border: 1px solid #BCBCBC;
width: 100%
display: flex;
align-self: flex-end;
position: absolute;
top: 95px;
box-sizing: border-box;
`