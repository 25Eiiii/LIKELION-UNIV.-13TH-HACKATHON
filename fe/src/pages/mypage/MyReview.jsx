import styled from "styled-components"
import useMyReviewStore from "../../store/useMyReviewStore";
import { useMyReviews } from "../../hooks/useMyReview";

const MyReview = () => {
  const { isLoading, isError } = useMyReviews();
  const reviews = useMyReviewStore(state => state.reviews);

  if (isLoading) return <Wrapper>불러오는 중</Wrapper>;
  if (isError) return <Wrapper>오류 발생</Wrapper>
    
  return (
    <Wrapper>
        {reviews.map((review, idx) => (
            <Card key={idx}>
                <Thumbnail src={review.main_img} />
                <Info>
                  <Top>
                    <Title>{review.title}</Title>
                    <Date>{review.created_at}</Date>
                  </Top>
                  <Review>{review.content}</Review>
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
