import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useMyEvents } from "../../hooks/useMyEvents";
import { useMyReview } from "../../hooks/useMyReview"; // 내가 쓴 후기 목록

// 제목 매칭 보조(공백/대소문자 무시)
const normalize = (s = "") => s.replace(/\s/g, "").toLowerCase();

const MyCultureLog = () => {
  const nav = useNavigate();
  const { data: events = [], isLoading, isError } = useMyEvents();
  const { data: reviews = [] } = useMyReview(); // [{ id, title, ... }]

  const reviewedByTitle = new Set(reviews.map((r) => normalize(r.title)));

  const hasReview = (ev) => reviewedByTitle.has(normalize(ev.title));

  if (isLoading) return <Wrapper>불러오는 중</Wrapper>;
  if (isError) return <Wrapper>오류 발생</Wrapper>;
  if (!events.length) return <Wrapper>표시할 행사가 없습니다.</Wrapper>;

  return (
    <Wrapper>
      {events.map((event) => {
        const done = hasReview(event);
        return (
          <CardGroup key={(event.id ?? event.eventKey) || event.title}>
            <CultureItem>
              <CultureThumbnail
                src={event.main_img || `${process.env.PUBLIC_URL}/images/post.svg`}
                alt={event.title}
                onError={(e) => (e.currentTarget.src = `${process.env.PUBLIC_URL}/images/post.svg`)}
              />
              <CultureInfo>
                <CultureTitle>{event.title}</CultureTitle>
                {event.date && <CultureDate>{event.date}</CultureDate>}
                {event.place && <CultureLocation>{event.place}</CultureLocation>}
              </CultureInfo>
            </CultureItem>

            <ReviewBtn
              $done={done}
              disabled={done}
              aria-disabled={done}
              onClick={() => !done && nav(`/write-review/${event.event_id}`, { state: event })}
            >
              {done ? "후기 작성완료" : "후기 작성하기"}
            </ReviewBtn>
          </CardGroup>
        );
      })}
    </Wrapper>
  );
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
top: 75px;
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
width: 130px;
`