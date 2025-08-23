import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as S from "../styles/pages/styledSurvey";
import { Container } from "../styles/common/styledContainer";
import NavBar from "../components/Navbar";
import {api} from "../api/fetcher";

const Survey = () => {
  const firstList = [
    "모락모락 앱",
    "친구/가족 추천",
    "SNS/온라인 홍보",
    "행사 포스터/전단",
    "기타(직접 입력)",
  ];
  const secondList = ["혼자", "친구와", "가족과", "아이와 함께"];
  const lastList = ["예", "아니오"];

  const [q1, setQ1] = useState("");
  const [q2, setQ2] = useState("");
  const [q4, setQ4] = useState("");
  const [data, setData] = useState("");

  const { id } = useParams();
  const navigate = useNavigate();

  const today = new Date();
  const formattedDate = `${today.getFullYear()}.${String(
    today.getMonth() + 1
  ).padStart(2, "0")}.${String(today.getDate()).padStart(2, "0")}`;

  useEffect(() => {
    const fetchdata = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        const headers =
          accessToken && accessToken !== "null" && accessToken !== "undefined"
            ? { Authorization: `Bearer ${accessToken}` }
            : {};
        const response = await api.get(`/api/details/detail/${id}/`, {
          headers,
        });
        setData(response.data);
      } catch (error) {
        console.error("데이터 불러오기 실패: ", error);
        if (error.response.status === 401) {
          alert("로그인 유효시간이 지났습니다. 다시 로그인해 주세요.");
          navigate("/login");
        }
      }
    };
    fetchdata();
  }, []);

  const submit = async () => {
    const accessToken = localStorage.getItem("accessToken");
    try {
      const response = await api.post(
        `/api/surveys/submit/`,
        { event: Number(id) },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      alert("제출 완료되었습니다!");
      navigate(-1);
    } catch (error) {
      console.log(error.response);
      if (error.response.status === 401) {
        alert("로그인 유효시간이 지났습니다. 다시 로그인해 주세요.");
        navigate("/login");
      } else if (error.response.status === 400) alert(error.response.data);
    }
  };

  return (
    <>
      <Container>
        <S.InnerWrapper>
          <S.Header>
            <S.Back onClick={() => navigate(-1)}>
              <img
                src={`${process.env.PUBLIC_URL}/images/backbtn.svg`}
                alt="back"
              />
            </S.Back>
            <S.Title>참여 인증 설문</S.Title>
          </S.Header>
          <S.TableBox>
            <S.Table>
              <S.Tbody>
                <S.Tr>
                  <S.Th
                    scope="row"
                    style={{ borderRight: "1px solid #CFCFCF" }}
                  >
                    행사명
                  </S.Th>
                  <S.Td>{data.title}</S.Td>
                </S.Tr>
                <S.Tr>
                  <S.Th
                    scope="row"
                    style={{
                      borderTop: "1px solid #CFCFCF",
                      borderRight: "1px solid #CFCFCF",
                    }}
                  >
                    참여 날짜
                  </S.Th>
                  <S.Td style={{ borderTop: "1px solid #CFCFCF" }}>
                    <input placeholder={formattedDate} />
                  </S.Td>
                </S.Tr>
              </S.Tbody>
            </S.Table>
          </S.TableBox>

          <S.Question>
            1. 이 행사를 어디서 알게 되었나요? (단일 선택)
          </S.Question>
          {firstList.map((f) => (
            <S.Qbox>
              <S.Option
                type="radio"
                name="q1"
                value={f}
                checked={q1 === f}
                onChange={(e) => setQ1(e.target.value)}
              />

              <label>{f}</label>
            </S.Qbox>
          ))}
          <S.Etc style={{ marginTop: "7px" }} />

          <S.Question style={{ marginTop: "30px" }}>
            2. 행사에 누구와 함께 오셨나요? (단일 선택)
          </S.Question>
          {secondList.map((f) => (
            <S.Qbox>
              <S.Option
                type="radio"
                name="q2"
                value={f}
                checked={q2 === f}
                onChange={(e) => setQ2(e.target.value)}
              />

              <label>{f}</label>
            </S.Qbox>
          ))}

          <S.Question style={{ marginTop: "30px" }}>
            3. 행사에서 가장 인상 깊었던 점은 무엇이었나요? (단답형)
          </S.Question>
          <S.Etc />

          <S.Question style={{ marginTop: "30px" }}>
            4. 다음에 또 참여하고 싶나요?
          </S.Question>
          {lastList.map((f) => (
            <S.Qbox>
              <S.Option
                type="radio"
                name="q4"
                value={f}
                checked={q4 === f}
                onChange={(e) => setQ4(e.target.value)}
              />

              <label>{f}</label>
            </S.Qbox>
          ))}

          <S.Submit onClick={submit}>제출하기</S.Submit>
        </S.InnerWrapper>
      </Container>
    </>
  );
};
export default Survey;
