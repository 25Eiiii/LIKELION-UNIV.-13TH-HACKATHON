import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as D from "../styles/pages/styledDetailReview";
import { Container } from "../styles/common/styledContainer";
import NavBar from "../components/Navbar";
import axios from "axios";

const DetailReview = () => {
  const [isClicked, setIsClicked] = useState();
  const [data, setData] = useState(null);
  const [review, setReview] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();
  const goInfo = () => {
    navigate(`/detailInfo/${id}`);
  };

  useEffect(() => {
    const fetchdata = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        const headers = accessToken&& accessToken!=="null" && accessToken!=="undefined"
        ? {Authorization:`Bearer ${accessToken}`} : {};
        const response = await axios.get(
          `/api/details/detail/${id}/` ,{headers}
        );
        setData(response.data);
        setIsClicked(response.data.is_liked);
      } catch (error) {
        console.error("데이터 불러오기 실패: ", error);
        if (error?.response?.status === 401) {
        alert("로그인 유효시간이 지났습니다. 다시 로그인해 주세요.");
        navigate('/login');
      }
      }
    };

    const reviewData = async () => {
      const accessToken = localStorage.getItem("accessToken");
      try {
        const headers = accessToken&& accessToken!=="null" && accessToken!=="undefined"
        ? {Authorization:`Bearer ${accessToken}`} : {};
        const response = await axios.get(`/api/surveys/reviews/event/${id}/`, {
          headers
        });
        setReview(response.data);
      } catch (error) {
        console.error(error?.response);
      }
    };
    fetchdata();
    reviewData();
  }, [id]);
  
  const toggleLike = async() => {
      const accessToken = localStorage.getItem("accessToken");
      if(!accessToken||accessToken==="null"||accessToken==="undefined") {
        alert("로그인 후 사용 가능합니다.");
        navigate("/login");
        return;
      }
      const prev = isClicked;
      setIsClicked(!prev);
      try{
        const response = await axios.post(
          `/api/details/detail/${id}/like/`,
          {},
          {
            headers: {
              Authorization : `Bearer ${accessToken}`,
              "Content-Type" : "application/json" 
            }
          }
        );
        setIsClicked(response.data.liked);
      }catch(error){
        setIsClicked(prev);
        console.error(error.response.data);
      }
    };
  return (
    <>
      <Container>
        <D.InnerWrapper>
          <D.Header>
            <img src={data?.main_img} alt="poster" width="428px" />
            <D.CloudyBox></D.CloudyBox>
            <D.TextBox>
              <D.NameBox>
                <D.Name>{data?.title}</D.Name>
              </D.NameBox>
              <D.Type>{data?.codename}</D.Type>
              <D.IconBox>
                <D.Heart
                  src={`${process.env.PUBLIC_URL}/images/${
                    isClicked ? "fullheart.svg" : "blankheart.svg"
                  }`}
                  alt="heart"
                  onClick={toggleLike}
                />
                <D.Share
                  src={`${process.env.PUBLIC_URL}/images/share.svg`}
                  alt="share"
                />
              </D.IconBox>
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
              {review.map((item) => {
                const photos = Array.isArray(item.photo)
                  ? item.photo
                  : item.photo
                  ? [item.photo]
                  : [];
                return (
                  <D.ReviewBox>
                    <D.ReviewGrayBox>
                      <D.UserInfoBox>
                        <D.Nickname>{item.nickname}</D.Nickname>
                        <D.Date>{item.created_at}</D.Date>
                      </D.UserInfoBox>
                      {photos.length > 0 && (
                        <D.UserImage>
                          {photos.map((imgSrc) => (
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
                );
              })}
            </>
          </D.WhiteContainer>
        </D.InnerWrapper>
      </Container>
      <NavBar></NavBar>
    </>
  );
};

export default DetailReview;
