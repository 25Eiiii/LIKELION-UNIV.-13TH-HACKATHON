import styled from "styled-components";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import useAuthStore from "../../store/useAuthStore";
import useMyReviewStore from "../../store/useMyReviewStore";
import { useMyReviews } from "../../hooks/useMyReview";
import { api } from "../api/fetcher"

const MyReview = () => {
  const queryClient = useQueryClient();
  const token =
    useAuthStore((s) => s.accessToken || s.token || s.access) ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("access") || "";

  const { isLoading, isError } = useMyReviews();
  const reviews = useMyReviewStore((state) => state.reviews) || [];

  const deleteReview = async (reviewId) => {
    try {
      await axios.delete("/api/surveys/my-reviews/${reviewId}/", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      await queryClient.invalidateQueries({ queryKey: ["my-reviews"] });
      alert("후기가 삭제되었습니다.");
    } catch (error) {
      console.error(error);
      alert("삭제 실패");
    }
  };

  if (isLoading) return <Wrapper style={{ marginLeft: "13px" }}>불러오는 중</Wrapper>;
  if (isError)   return <Wrapper style={{ marginLeft: "13px" }}>오류 발생 (로그인/토큰 확인)</Wrapper>;
  if (!reviews.length) return <Wrapper style={{ marginLeft: "13px" }}>아직 작성한 후기가 없어요.</Wrapper>;

  return (
    <Wrapper>
      {reviews.map((review) => (
        <Card key={review.id}>
          <Thumbnail
            src={review.main_img || `${process.env.PUBLIC_URL}/images/post.svg`}
            alt={review.title}
            onError={(e) => (e.currentTarget.src = `${process.env.PUBLIC_URL}/images/post.svg`)}
          />
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
                onClick={() => deleteReview(review.id)}
                style={{ cursor: "pointer" }}
              />
            </DelBtn>
          </Info>
        </Card>
      ))}
    </Wrapper>
  );
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
  background: #eee;
  border-radius: 12px;
  padding: 12px;
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
  gap: 11px;
  flex: 1;
  min-width: 0;
`;

const Top = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  min-height: 14px;
`;

const Title = styled.p`
  color: #2f3f78;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  width: 210px;
`;

const Date = styled.p`
  color: #707070;
  font-size: 11px;
  font-weight: 400;
  margin: 0;
  margin-top: 5px;
`;

const Review = styled.p`
  color: #707070;
  font-size: 15px;
  font-weight: 400;
  margin: 0;
`;

const DelBtn = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-end;
`;