import React, { useEffect } from 'react';
import { Container } from '../../styles/common/styledContainer';
import * as S from "../../styles/pages/styledStep"
import { useTogetherStore } from '../../store/useSurveyStore';
import { useNavigate } from 'react-router-dom';

const Step2 = () => {
  const { selectedTogether, setSelectedTogether } = useTogetherStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedTogether !== null) {
        const timer = setTimeout(() => {
            navigate("/home");
        }, 500);
        return () => clearTimeout(timer);
    }
  },[selectedTogether, navigate]);

  return (
    <Container>
        <S.StepWrapper>
            <S.StepBar>
                <S.Step2BarFill></S.Step2BarFill>
            </S.StepBar>
            <S.StepNum>
                2 / 3
            </S.StepNum>
        </S.StepWrapper>
        <S.TextWrapper>
            <S.TextTitle>
            누구와 함께하고 싶으신가요?
            </S.TextTitle>
            <S.TextExplain>누구와 함께하면 더 즐거울까요?<br></br>선택하신 분과 함께하기 좋은 행사를 찾아드릴게요</S.TextExplain>
        </S.TextWrapper>
        <S.TogetherWrapper>
            {together.map((item, idx) => (
                <S.TogetherItem
                    key={idx}
                    isSelected={selectedTogether === idx}
                    onClick={() => setSelectedTogether(idx)}
                >
                    {item}
                </S.TogetherItem>
            ))}
        </S.TogetherWrapper>
    </Container>
  )
};

export default Step2;

const together = [
    "혼자",
    "친구와",
    "연인과",
    "가족과",
    "아이와 함께"
]