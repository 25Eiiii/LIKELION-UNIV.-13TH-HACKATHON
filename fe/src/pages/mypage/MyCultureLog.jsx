import EventCardS from '../../components/EventCardS';
import React from 'react';
import styled from 'styled-components';
import { useMyEvents } from '../../hooks/useMyEvents';
import useMyEventStore from '../../store/useMyEventStore';

const MyCultureLog = () => {
  const { isLoading, isError } = useMyEvents();
  const events = useMyEventStore(state => state.events);

  if (isLoading) return <Wrapper>불러오는 중</Wrapper>;
  if (isError) return <Wrapper>오류 발생</Wrapper>
  
    
  return (
    <Wrapper>
      {events.map((event, idx) => (
        <CardGroup key={idx}>
          <CultureItem>
            <CultureThumbnail 
              src={event.main_img}
              alt={event.title}
            />
            <CultureInfo>
                <CultureTitle>{event.title}</CultureTitle>
                <CultureDate>{event.date}</CultureDate>
                <CultureLocation>{event.place}</CultureLocation>
            </CultureInfo>
          </CultureItem>
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

export const CultureItem = styled.div`
display: flex;
gap: 30px;
`

export const CultureThumbnail = styled.img`
width: 93px;
height: 127px;
flex-shrink: 0;
`

export const CultureInfo = styled.div`
display: flex;
flex-direction: column;
gap: 10px;
`

export const CultureTitle = styled.div`
color: #353535;
font-family: Pretendard;
font-size: 17px;
font-style: normal;
font-weight: 600;
line-height: normal;
`

export const CultureDate = styled.div`
color: #404040;
font-family: Pretendard;
font-size: 13px;
font-style: normal;
font-weight: 400;
line-height: normal;
`

export const CultureLocation = styled.div`
color: #848484;
font-family: Pretendard;
font-size: 13px;
font-style: normal;
font-weight: 400;
line-height: normal;
`