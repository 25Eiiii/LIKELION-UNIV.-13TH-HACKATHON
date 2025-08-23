import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as S from "../styles/pages/StyledSignUp";
import { Container } from "../styles/common/styledContainer";
import {api} from "../api/fetcher";

const SignUp = () => {
  const navigate = useNavigate();

  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("");
  const [nickname, setNickname] = useState("");
  const [address, setAddress] = useState("");
  const [idError, setIdError] = useState("");
  const [idAvailable, setIdAvailable] = useState("null");
  const [errors, setErrors] = useState({});

  const goCheck = async () => {
    try {
      const response = await api.get(
        `/api/accounts/check-username/?username=${id}`
      );

      if (response.data.available) {
        setIdAvailable(true);
        setIdError("사용하실 수 있는 아이디입니다.");
      } else {
        setIdAvailable(false);
        setIdError("이미 사용하고 있는 아이디입니다.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const goSignup = async () => {
    try {
      const response = await api.post(
        "/api/accounts/signup/",
        {
          username: id,
          password: password,
          password2: passwordCheck,
          nickname: nickname,
          address: address,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
        
      );
      
      navigate('/login');
    } catch (error) {
      console.error("회원가입 에러: ",error.response);
      setErrors(error.response.data);
    }
  };
  return (
    <>
      <Container>
        <S.InnerWrapper>
          <S.BackGround>
            <img src={`${process.env.PUBLIC_URL}/images/background.svg`} />
          </S.BackGround>
          <S.Header>회원가입</S.Header>
          <S.Label>아이디</S.Label>
          <S.IdBox>
            <S.Id
              placeholder="아이디"
              value={id}
              onChange={(e) => {
                setId(e.target.value);
                setIdAvailable("");
                setIdError("");
              }}
              style={{
                border:
                  idAvailable === true
                    ? "2px solid #60C795"
                    : idAvailable === false
                    ? "2px solid #EF4452"
                    : "2px solid #ABABAB",
              }}
            />
            <S.CheckBox onClick={goCheck}>중복확인</S.CheckBox>
          </S.IdBox>
          <S.Alarm>4~12자/ 영문 소문자(숫자 조합 가능)</S.Alarm>
          <S.Error
            style={{
              display: idAvailable !== null ? "flex" : "none",
              color: idAvailable === true ? "#4EC789" : "#F93E3E",
            }}
          >
            {idError}
          </S.Error>

          <S.Label>비밀번호</S.Label>
          <S.PassWord
            placeholder="비밀번호"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <S.PassWordCheck
            placeholder="비밀번호 확인"
            type="password"
            value={passwordCheck}
            onChange={(e) => setPasswordCheck(e.target.value)}
          />
          <S.Alarm>
            6~ 20자 / 영문 대문자, 소문자, 숫자, 특수문자 중 2가지 이상 조합
          </S.Alarm>

          <S.Label>닉네임</S.Label>
          <S.Nickname
            placeholder="닉네임"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
          <S.Alarm>2~10자 / 특수문자 포함 x</S.Alarm>
          
          <S.Label>주소</S.Label>
          <S.Address
            placeholder="ex) 서울특별시 성북구 보문로 168"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <S.SignUp onClick={goSignup}>가입하기</S.SignUp>
        </S.InnerWrapper>
      </Container>
    </>
  );
};
export default SignUp;
