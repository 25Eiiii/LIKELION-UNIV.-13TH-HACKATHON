import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as S from "../styles/pages/StyledSignUp";
import { Container } from "../styles/common/styledContainer";

const SignUp = () => {
  return (
    <>
      <Container>
        <S.InnerWrapper>
          <S.BackGround>
            <img
                src={`${process.env.PUBLIC_URL}/images/background.svg`}
            />
          </S.BackGround>
            <S.Header>회원가입</S.Header>
            <S.Label>아이디</S.Label>
            <S.IdBox>
              <S.Id placeholder="아이디"/>
              <S.CheckBox>중복확인</S.CheckBox>
            </S.IdBox>
            <S.Alarm>
                4~12자/ 영문 소문자(숫자 조합 가능)
            </S.Alarm>
            <S.Label>비밀번호</S.Label>
            <S.PassWord placeholder="비밀번호" type="password"/>
            <S.PassWordCheck placeholder="비밀번호 확인" type="password"/>
            <S.Alarm>
                6~ 20자 / 영문 대문자, 소문자, 숫자, 특수문자 중 2가지 이상 조합
            </S.Alarm>

            <S.Label>닉네임</S.Label>
            <S.Nickname placeholder="닉네임"/>
            <S.Alarm>2~10자 / 특수문자 포함 x</S.Alarm>

            <S.SignUp>가입하기</S.SignUp>
        </S.InnerWrapper>
      </Container>
    </>
  );
};
export default SignUp;
