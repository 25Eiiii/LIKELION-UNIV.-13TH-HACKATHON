import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container } from "../../styles/common/styledContainer";
import { useTypeStore } from "../../store/useSurveyStore";
import * as S from "../../styles/pages/styledStep"

const Step3 = () => {
  const { selectedType, setSelectedType }= useTypeStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedType !== null) {
        const timer = setTimeout(() => {
            navigate("/home");
        }, 500);
        return () => clearTimeout(timer);
    }
  }, [selectedType, navigate]);

  return (
    <Container>
        <S.StepWrapper>
            <S.StepBar>
                <S.Step2BarFill></S.Step2BarFill>
            </S.StepBar>
            <S.StepNum>
                3 / 3
            </S.StepNum>
        </S.StepWrapper>
        <S.TextWrapper>
            <S.TextTitle>
            누구와 함께하고 싶으신가요?
            </S.TextTitle>
            <S.TextExplain>누구와 함께하면 더 즐거울까요?<br></br>선택하신 분과 함께하기 좋은 행사를 찾아드릴게요</S.TextExplain>
        </S.TextWrapper>
        <S.TogetherWrapper>
            {type.map((item, idx) => (
                <S.TogetherItem
                    key={idx}
                    isSelected={selectedType === idx}
                    onClick={() => setSelectedType(idx)}
                >
                    {item}
                </S.TogetherItem>
            ))}
        </S.TogetherWrapper>
    </Container>
  )
};

export default Step3;

const type = [
    "체험형",
    "관람형",
    "모임형",
    "학습형",
]