import styled from "styled-components"

import React from 'react';

const MyReview = () => {
  const logs = [
    {
        title: "스테이 성북",
        date: "2025.08.31",
        review: "좋다는 리뷰와 함께 첨부된 사진과 줄글로 된 리뷰 몇 줄 좋다는 리뷰와 함께 첨부된 사진과 줄글로 된 리뷰 몇 줄",
        thumbnail: "post2.svg",
    },
    {
        title: "한옥 쉼표, 싱잉볼 테라피",
        date: "2025.08.31",
        review: "좋다는 리뷰와 함께 첨부된 사진과 줄글로 된 리뷰 몇 줄 좋다는 리뷰와 함께 첨부된 사진과 줄글로 된 리뷰 몇 줄",
        thumbnail: "post3.svg",
    },
    {
        title: "한옥 쉼표, 싱잉볼 테라피",
        date: "2025.08.31",
        review: "좋다는 리뷰와 함께 첨부된 사진과 줄글로 된 리뷰 몇 줄 좋다는 리뷰와 함께 첨부된 사진과 줄글로 된 리뷰 몇 줄",
        thumbnail: "post3.svg",
    },
    ];
    
  return (
    <Wrapper>
        {logs.map((log, idx) => (
            <Card key={idx}>
                <Thumbnail src={`${process.env.PUBLIC_URL}/images/${log.thumbnail}`} />
                <Info>
                  <Top>
                    <Title>{log.title}</Title>
                    <Date>{log.date}</Date>
                  </Top>
                  <Review>{log.review}</Review>
                  <DelBtn>
                    <img
                    src={`${process.env.PUBLIC_URL}/images/trash.svg`}
                      alt="trash"
                    >
                    </img>
                  </DelBtn>
                </Info>
            </Card>
        ))}
    </Wrapper>
  )
};

export default MyReview;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 20px 13px;
`;

const Card = styled.div`
display: flex;
gap: 20px;
background: #fff;
border-radius: 12px;
padding: 12px;
border-radius: 7px;
background: #EEE;
align-items: flex-start;
`;

const Thumbnail = styled.img`
width: 78px;
height: 106px;
flex-shrink: 0;
border-radius: 6px;
object-fit: cover;
display: block;
`;

const Info = styled.div`
display: flex;
flex-direction: column;
justify-content: flex-start;
padding: 0;
margin: 0;
gap: 11px;
`

const Top = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 14px;
`;

const Title = styled.p`
color: #2F3F78;
font-family: Pretendard;
font-size: 16px;
font-style: normal;
font-weight: 600;
line-height: normal;
margin: 0;
display: flex;
`;

const Date = styled.p`
color: #707070;
font-family: Pretendard;
font-size: 11px;
font-style: normal;
font-weight: 400;
line-height: normal;
`;

const Review = styled.p`
color: #707070;
font-family: Pretendard;
font-size: 15px;
font-style: normal;
font-weight: 400;
line-height: normal;
margin: 0;
`
const DelBtn = styled.div`
width: 100%;
justify-content: flex-end;
display:flex;
`
