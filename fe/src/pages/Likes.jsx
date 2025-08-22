import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as L from "../styles/pages/styledLikes";
import { Container } from "../styles/common/styledContainer";
import NavBar from "../components/Navbar";
import axios from "axios";
import useAuthStore from "../store/useAuthStore";

const Likes = () => {
  const navigate = useNavigate();
  const nickname = useAuthStore((s)=>s.nickname)
  const [data, setData] = useState([]);
  const [isClicked, setIsClicked] = useState({});
  const togglePoint = (id) => {
    setIsClicked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    const fetchdata = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        const response = await axios.get(`/api/details/liked/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });
        setData(response.data);
      } catch (error) {
        if (error.response.status === 401) {
          alert("로그인 유효시간이 지났습니다. 다시 로그인해 주세요.");
          navigate("/login");
        }
      }
    };
    fetchdata();
  }, []);

  const toggleLike = async (id) => {
    const accessToken = localStorage.getItem("accessToken");
    try {
      const response = await axios.post(
        `/api/details/detail/${id}/like/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      setData((prev) => prev.filter((it) => it.id !== id));
    } catch (error) {
      if (error.response.status === 401) {
        alert("로그인 유효시간이 지났습니다. 다시 로그인해 주세요.");
        navigate("/login");
      }
    }
  };
  return (
    <>
      <Container>
        <L.InnerWrapper>
          <L.Header>
            <L.Back onClick={() => navigate(-1)}>
              <img
                src={`${process.env.PUBLIC_URL}/images/backbtn.svg`}
                alt="back"
              />
            </L.Back>
            <L.HeaderTitle>좋아요</L.HeaderTitle>
          </L.Header>
          <L.Text>
            <p style={{ padding: 0, marginBottom: 0, marginTop: "30px" }}>
              {`${nickname}`}님이 좋아한 행사,
            </p>
            <p style={{ padding: 0, margin: 0 }}>
              지금 신청하고 특별한 경험을 시작하세요🚀
            </p>
          </L.Text>

          {data.length === 0 && <p style={{ marginLeft: 20 }}>로딩 중..</p>}
          {data?.map((item) => (
            <L.DataBox key={item.id}>
              <L.Img
                onClick={() => navigate(`/detailInfo/${item.id}`)}
                style={{ cursor: "pointer" }}
                src={item.main_img}
              />
              <L.TextBox>
                <L.Title
                  onClick={() => navigate(`/detailInfo/${item.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  {item.title}
                </L.Title>
                <L.Date>{item.date}</L.Date>
                <L.Agency>{item.place}</L.Agency>
              </L.TextBox>
              <L.IconBox>
                <L.Heart onClick={() => toggleLike(item.id)}>
                  <img
                    src={`${process.env.PUBLIC_URL}/images/fullheart.svg`}
                    alt="heart"
                  />
                </L.Heart>
                <L.PointIcon onClick={() => togglePoint(item.id)}>
                  <img
                    src={`${process.env.PUBLIC_URL}/images/${
                      isClicked[item.id] ? "pointon.svg" : "point.svg"
                    }`}
                    alt="point"
                  />
                </L.PointIcon>
                <L.Point
                  style={{ display: isClicked[item.id] ? "flex" : "none" }}
                >
                  {item.reward_point + 100} P
                </L.Point>
              </L.IconBox>
            </L.DataBox>
          ))}
          <L.Box></L.Box>
        </L.InnerWrapper>
      </Container>
      <NavBar></NavBar>
    </>
  );
};
export default Likes;
