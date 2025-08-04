import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as D from "../styles/pages/styledDetailReview";
import { Container } from "../styles/common/styledContainer";
import NavBar from "../components/Navbar";

const DetailReview = () => {
  const [isClicked, setIsClicked] = useState(false);
  const navigate = useNavigate();
  const goInfo = () => {
    navigate("/detailInfo");
  };
  const reviewList = [
    {
      profile: "/images/profile.svg",
      nickname: "닉네임",
      date: "2025.08.31",
      image: "",
      content:
        "좋다는 리뷰와 함께 첨부된 사진과 줄글로 된 리뷰 몇 줄좋다는 리뷰와 함께 첨부된 사진과 줄글로 된 리뷰 몇 줄좋다는 리뷰와 함께 첨부된 사진과 줄글로 된 리뷰 몇 줄",
    },
    {
      profile: "/images/profile.svg",
      nickname: "닉네임",
      date: "2025.08.31",
      image: "",
      content:
        "좋다는 리뷰와 함께 첨부된 사진과 줄글로 된 리뷰 몇 줄좋다는 리뷰와 함께 첨부된 사진과 줄글로 된 리뷰 몇 줄좋다는 리뷰와 함께 첨부된 사진과 줄글로 된 리뷰 몇 줄",
    },
    {
      profile: "/images/profile.svg",
      nickname: "닉네임",
      date: "2025.08.31",
      image: "",
      content:
        "좋다는 리뷰와 함께 첨부된 사진과 줄글로 된 리뷰 몇 줄좋다는 리뷰와 함께 첨부된 사진과 줄글로 된 리뷰 몇 줄좋다는 리뷰와 함께 첨부된 사진과 줄글로 된 리뷰 몇 줄",
    },
    {
      profile: "/images/profile.svg",
      nickname: "닉네임",
      date: "2025.08.31",
      image: ["/images/poster.svg", "/images/poster.svg"],
      content:
        "좋다는 리뷰와 함께 첨부된 사진과 줄글로 된 리뷰 몇 줄좋다는 리뷰와 함께 첨부된 사진과 줄글로 된 리뷰 몇 줄좋다는 리뷰와 함께 첨부된 사진과 줄글로 된 리뷰 몇 줄",
    },
  ];
  return (
    <>
      <Container>
        <D.InnerWrapper>
          <D.Header>
            <img
              src={`${process.env.PUBLIC_URL}/images/poster.svg`}
              alt="poster"
              width="428px"
            />
            <D.CloudyBox></D.CloudyBox>
            <D.TextBox>
              <D.NameBox>
                <D.Name>흙의 숨결</D.Name>
                <D.Type>전시/미술</D.Type>
              </D.NameBox>
              <D.Explain>
                성북구의 공공미술관으로 조성되어 대중의 품 안에 자리하게 된
                성북구립 최만린미술관이 정식 개관을 맞아 &lt;흙의 숨결&gt; 전을
                개최합니다.
              </D.Explain>
              {isClicked ? (
                <D.Heart
                  src={`${process.env.PUBLIC_URL}/images/fullheart.svg`}
                  alt="heart"
                  onClick={() => setIsClicked(false)}
                />
              ) : (
                <D.Heart
                  src={`${process.env.PUBLIC_URL}/images/blankheart.svg`}
                  alt="blankheart"
                  onClick={() => setIsClicked(true)}
                />
              )}

              <D.Share
                src={`${process.env.PUBLIC_URL}/images/share.svg`}
                alt="share"
              />
            </D.TextBox>
          </D.Header>
          <D.WhiteContainer>
            <D.Tab>
              <D.EventInfo onClick={goInfo} style={{ cursor: "pointer" }}>
                행사 정보
              </D.EventInfo>
              <D.Review style={{ cursor: "default" }}>
                참여 후기
                <D.MiniLine></D.MiniLine>
              </D.Review>
            </D.Tab>
            <D.Line></D.Line>
            <>
              {reviewList.map((item) => (
                <D.ReviewBox>
                  <img src={item.profile} height="31px" />
                  <D.ReviewGrayBox>
                    <D.UserInfoBox>
                      <D.Nickname>{item.nickname}</D.Nickname>
                      <D.Date>{item.date}</D.Date>
                    </D.UserInfoBox>
                    {item.image && (
                      <D.UserImage>
                        {item.image.map((imgSrc) => (
                          <img
                            src={imgSrc}
                            alt="reviewimage"
                            style={{
                              width: "97px",
                              height: "107px",
                              borderRadius: "7px",
                            }}
                          />
                        ))}
                      </D.UserImage>
                    )}

                    <D.UserText>{item.content}</D.UserText>
                  </D.ReviewGrayBox>
                </D.ReviewBox>
              ))}
            </>
          </D.WhiteContainer>
        </D.InnerWrapper>
      </Container>
      <NavBar></NavBar>
    </>
  );
};

export default DetailReview;
