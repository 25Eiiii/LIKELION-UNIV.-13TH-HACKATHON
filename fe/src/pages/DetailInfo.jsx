import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as D from "../styles/pages/styledDetailInfo";
import { Container } from "../styles/common/styledContainer";
import NavBar from "../components/Navbar";
import axios from "axios";

const DetailInfo = () => {
  const [data, setData] = useState(null);
  const { id } = useParams();
  const [dropdown, setDropDown] = useState(false);
  const [isClicked, setIsClicked] = useState();

  useEffect(() => {
    const fetchdata = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        const headers = accessToken&& accessToken!=="null" && accessToken!=="undefined"
        ? {Authorization:`Bearer ${accessToken}`} : {};
        const response = await axios.get(`/api/details/detail/${id}/`,{headers});
        setData(response.data);
        setIsClicked(response.data.is_liked);
      } catch (error) {
        console.error("데이터 불러오기 실패: ", error);
        if (error.response.status === 401) {
        alert("로그인 유효시간이 지났습니다. 다시 로그인해 주세요.");
        navigate('/login');
      }
      }
    };
    fetchdata();
  }, [id]);

  const toggleLike = async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (
      !accessToken ||
      accessToken === "null" ||
      accessToken === "undefined" ||
      accessToken.trim() === ""
    ) {
      alert("로그인 후 사용 가능합니다.");
      navigate("/login");
      return;
    }
    const prev = isClicked;
    setIsClicked(!prev);
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
      setIsClicked(response.data.liked);
    } catch (error) {
      setIsClicked(prev);
      if (error.response.status === 401) {
        alert("로그인 유효시간이 지났습니다. 다시 로그인해 주세요.");
        navigate('/login')
      }

      console.error(error.response.data);
    }
  };
  const infoList = data
    ? [
        { label: "제목 : ", value: data.title },
        { label: "기간 : ", value: data.date },
        { label: "장소 : ", value: data.place },
        { label: "신청일 : ", value: data.rgst_date },
      ]
    : [];

  const detailList = data
    ? [
        { label: "관람료 : ", value: data.use_fee },
        { label: "관람 연령 : ", value: data.use_trgt },
        { label: "관련 정보 : ", value: data.hmpg_addr },
      ]
    : [];
  const stores = [
    {
      name: "달빛한술",
      image: "/images/store.svg",
      link: "",
    },
    {
      name: "초록숟가락",
      image: "/images/store2.svg",
      link: "",
    },
    {
      name: "담연",
      image: "/images/store3.svg",
      link: "",
    },
  ];
  const navigate = useNavigate();
  const goReview = () => {
    navigate(`/detailReview/${id}`);
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
              <D.EventInfo style={{ cursor: "default" }}>
                행사 정보
                <D.MiniLine></D.MiniLine>
              </D.EventInfo>
              <D.Review onClick={goReview} style={{ cursor: "pointer" }}>
                참여 후기
              </D.Review>
            </D.Tab>
            <D.Line></D.Line>
            <D.BasicInfo>
              <img
                src={`${process.env.PUBLIC_URL}/images/calendar.svg`}
                alt="calendar"
                style={{ marginRight: "10px" }}
              />
              필수 정보
            </D.BasicInfo>
            <D.BasicGrayBox>
              {infoList.map((item) => (
                <D.InfoTextBox>
                  <D.GrayText>{item.label}</D.GrayText>
                  <D.BlackText>{item.value}</D.BlackText>
                </D.InfoTextBox>
              ))}
            </D.BasicGrayBox>

            <D.DetailInfo>
              <img
                src={`${process.env.PUBLIC_URL}/images/clip.svg`}
                alt="clip"
                style={{ marginRight: "10px" }}
              />
              기타 정보
            </D.DetailInfo>
            <D.DetailBox>
              {detailList.map((item) => (
                <D.InfoTextBox>
                  <D.GrayText>{item.label}</D.GrayText>
                  <D.BlackText>
                    {item.label === "관련 정보 : " ? (
                      <a
                        href={item.value}
                        style={{ textDecoration: "none", color: "#575757" }}
                      >
                        {item.value}
                      </a>
                    ) : (
                      item.value
                    )}
                  </D.BlackText>
                </D.InfoTextBox>
              ))}
            </D.DetailBox>

            <D.PointBox>
              <D.GainPointText>
                <img
                  src={`${process.env.PUBLIC_URL}/images/pointalarm.svg`}
                  alt="alarm"
                  style={{ marginRight: "10px" }}
                />
                이 행사에서 받을 수 있는 포인트 : 총{" "}
                <span style={{ color: "#232D54", fontWeight: "600" }}>
                  {data?.reward_point + 100} P
                </span>
              </D.GainPointText>

              <D.GuidePoint>
                <D.Guide>
                  <img
                    src={`${process.env.PUBLIC_URL}/images/check.svg`}
                    alt="check"
                    style={{ marginRight: "10px" }}
                  />
                  기본 참여
                  <span
                    style={{
                      color: "#282F56",
                      fontWeight: "600",
                      marginLeft: "10px",
                    }}
                  >
                    100 P
                  </span>
                </D.Guide>
                <D.Guide>
                  <img
                    src={`${process.env.PUBLIC_URL}/images/check.svg`}
                    alt="check"
                    style={{ marginRight: "10px" }}
                  />
                  후기 작성시
                  <span
                    style={{
                      color: "#282F56",
                      fontWeight: "600",
                      marginLeft: "10px",
                    }}
                  >
                    + 50 P
                  </span>
                </D.Guide>
                <D.Guide>
                  <img
                    src={`${process.env.PUBLIC_URL}/images/check.svg`}
                    alt="check"
                    style={{ marginRight: "10px" }}
                  />
                  인증샷 추가시
                  <span
                    style={{
                      color: "#282F56",
                      fontWeight: "600",
                      marginLeft: "10px",
                    }}
                  >
                    + 50 P
                  </span>
                </D.Guide>
              </D.GuidePoint>
              <D.PointLine></D.PointLine>
              <D.PointStandard
                onClick={() => setDropDown(!dropdown)}
                style={{ cursor: "pointer" }}
              >
                포인트 적립 기준 보기
                <img
                  src={`${process.env.PUBLIC_URL}/images/dropdown.svg`}
                  alt="dropdown"
                  style={{
                    marginLeft: "15px",
                    marginBottom: "2px",
                    cursor: "pointer",
                  }}
                />
              </D.PointStandard>

              <D.PointDetailBox style={{ display: dropdown ? "flex" : "none" }}>
                <D.BasicBox>
                  <D.Title>기본 참여</D.Title>
                  <D.Text>
                    ∙ 무료 행사 :{" "}
                    <span
                      style={{
                        color: "#484848",
                        fontWeight: "600",
                        marginLeft: "10px",
                      }}
                    >
                      100 P
                    </span>
                  </D.Text>
                  <D.Text>
                    ∙ 유료 행사 :{" "}
                    <span
                      style={{
                        color: "#484848",
                        fontWeight: "600",
                        marginLeft: "10px",
                      }}
                    >
                      300 P
                    </span>
                  </D.Text>
                </D.BasicBox>
                <D.PointDetailLine></D.PointDetailLine>
                <D.AddBox>
                  <D.Title>추가 적립</D.Title>
                  <D.Text>
                    ∙ 후기 작성 :{" "}
                    <span
                      style={{
                        color: "#484848",
                        fontWeight: "600",
                        marginLeft: "10px",
                      }}
                    >
                      + 50 P
                    </span>
                  </D.Text>
                  <D.Text style={{ marginLeft: "12px" }}>
                    ∙ 인증샷 추가 :{" "}
                    <span
                      style={{
                        color: "#484848",
                        fontWeight: "600",
                        marginLeft: "10px",
                      }}
                    >
                      + 50 P
                    </span>
                  </D.Text>
                </D.AddBox>
              </D.PointDetailBox>
              <D.WhiteAlarm style={{ display: dropdown ? "flex" : "none" }}>
                <img
                  src={`${process.env.PUBLIC_URL}/images/whitealarm.svg`}
                  alt="alarm"
                  style={{ marginLeft: "22px", marginRight: "6px" }}
                />
                생활예술 강좌 등 장기 프로그램은 수업별 출석 포인트 지급
              </D.WhiteAlarm>
            </D.PointBox>

            <D.QrBox>
              <img
                src="/images/qr.svg"
                alt="QR"
                style={{ marginRight: "16px" }}
              />
              설문 큐알 스캔하기
            </D.QrBox>
          </D.WhiteContainer>
          <D.RecommendBox>
            <D.RecText>
              전시 보면서 방문해보면 어때요?
              <br />
              성북 가이드{" "}
              <span style={{ color: "#60C795" }}>부기의 추천 장소 !</span>
            </D.RecText>
            <D.AlarmText>
              <img
                src={`${process.env.PUBLIC_URL}/images/greenalarm.svg`}
                alt="greencircle"
                style={{ marginRight: "6px" }}
              />
              매장에서 제휴 쿠폰을 사용 할 수 있어요
            </D.AlarmText>
            <D.RecommendList>
              {stores.map((store) => (
                <D.StoreBox>
                  <img src={store.image} alt={store.name} />
                  <D.StoreText>
                    {store.name}
                    <p
                      href={store?.link}
                      style={{
                        color: "#FFF",
                        fontSize: "10px",
                        marginLeft: "5px",
                        fontWeight: "500",
                        display: "inline-block",
                      }}
                    >
                      바로가기 &gt;
                    </p>
                  </D.StoreText>
                </D.StoreBox>
              ))}
            </D.RecommendList>
          </D.RecommendBox>
        </D.InnerWrapper>
      </Container>
      <NavBar></NavBar>
    </>
  );
};

export default DetailInfo;
