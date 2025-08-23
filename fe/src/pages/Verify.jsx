import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as V from "../styles/pages/styledVerify";
import { Container } from "../styles/common/styledContainer";
import NavBar from "../components/Navbar";
import axios from "axios";

const Verify = () => {
  const [data, setData] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchdata = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        const response = await axios.get(`/api/surveys/my-certified/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
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

  return (
    <>
      <Container>
        <V.InnerWrapper>
          <V.ChatBot src={`${process.env.PUBLIC_URL}/images/chatbot.svg`} />
          <V.Bubble>
            문화 행사에 참여하셨나요?
            <br /> 인증하고 포인트를 받아보세요!
          </V.Bubble>
          <V.VerifyBox style={{ marginBottom: "22px" }}>
            <img src={`${process.env.PUBLIC_URL}/images/camera.svg`} />
            <V.BoxText>
              QR코드
              <br />
              스캔으로 인증하기
            </V.BoxText>
          </V.VerifyBox>
          <V.VerifyBox>
            <img src={`${process.env.PUBLIC_URL}/images/upload.svg`} />
            <V.BoxText>
              사진
              <br />
              업로드로 인증하기
            </V.BoxText>
          </V.VerifyBox>
          <V.AlarmText>
            <img src={`${process.env.PUBLIC_URL}/images/grayalarm.svg`} />
            사진 인증 완료는 시간이 조금 걸릴 수 있어요
          </V.AlarmText>
          <V.Verified>
            <V.Text>내가 인증한 문화 행사</V.Text>
            {data?.map((item) => (
              <V.VerifiedBox>
                <V.Img src={item.main_img} />
                <V.Info>
                  <V.Title>{item.title}</V.Title>
                  <V.Date>
                    {item.start_date} - {item.end_date}
                  </V.Date>
                  <V.Place>{item.place}</V.Place>
                </V.Info>
                <V.Tag>인증 완료</V.Tag>
              </V.VerifiedBox>
            ))}
          </V.Verified>
          <V.Box></V.Box>
        </V.InnerWrapper>
      </Container>
    </>
  );
};
export default Verify;
