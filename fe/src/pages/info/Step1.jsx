import React, { useEffect } from 'react';
import { Container } from "../../styles/common/styledContainer";
import * as S from "../../styles/pages/styledStep"
import { useState } from 'react';
import useInterestStore from '../../store/useInfoStore';
import { useNavigate } from 'react-router-dom';

const Step1 = () => {
  const { selectedInterests, toggleInterest } = useInterestStore();
  const navigate = useNavigate();

  // 3개 선택 시 다음 단계로 이동 
  useEffect(() => {
    if (selectedInterests.length === 3) {
        const timer = setTimeout(()  => {
            navigate("/survey/step2");
        }, 500);

        return () => clearTimeout(timer);
    }
  }, [selectedInterests, navigate]);

  return (
    <Container style={{background: "linear-gradient(180deg, #FFF 0%, #F0FFF8 100%)"}}>
        <S.StepWrapper>
            <S.StepBar>
                <S.StepBarFill></S.StepBarFill>
            </S.StepBar>
            <S.StepNum>
                1 / 4
            </S.StepNum>
        </S.StepWrapper>
        <S.TextWrapper>
            <S.TextTitle>
            관심있는 주제를 <br></br>모두 선택해주세요
            </S.TextTitle>
            <S.TextExplain>관심 있는 주제를 <span>3가지</span> 선택해주세요! <br></br>내게 딱 맞는 문화 행사를 추천해드릴게요</S.TextExplain>
        </S.TextWrapper>
        <S.InterestsWrapper>
            {interests.map((item, idx) => (
                <S.InterestItem 
                    key={idx}
                    isSelected={selectedInterests.includes(idx)}
                    onClick={() => toggleInterest(idx)}    
                >
                    {item.name}
                </S.InterestItem>
            ))}
        </S.InterestsWrapper>
    </Container>
  )
};

export default Step1;

const interests = [
    {name: "교육/체험"},
    {name: "국악"},
    {name: "독주/독창회"},
    {name: "무용"},
    {name: "뮤지컬/오페라"},
    {name: "연극"},
    {name: "영화"},
    {name: "전시/미술"},
    {name: "축제-자연/경관"},
    {name: "축제-문화/예술"},
    {name: "축제-전통/역사"},
    {name: "축제-시민화합"},
    {name: "축제-기타"},
    {name: "콘서트"},
    {name: "클래식"},
    {name: "기타"},
]