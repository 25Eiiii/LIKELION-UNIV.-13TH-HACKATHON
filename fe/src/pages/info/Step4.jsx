import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container } from "../../styles/common/styledContainer";
import { useTypeStore } from "../../store/useInfoStore";
import * as S from "../../styles/pages/styledStep"

const Step4 = () => {
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
    <Container style={{background: "linear-gradient(180deg, #FFF 0%, #F0FFF8 100%)"}}>
        <S.StepWrapper>
            <S.StepBar>
                <S.Step4BarFill></S.Step4BarFill>
            </S.StepBar>
            <S.StepNum>
                4 / 4
            </S.StepNum>
        </S.StepWrapper>
        <S.TextWrapper>
            <S.TextTitle>
            참여하고 싶은 행사 형태를 골라주세요!
            </S.TextTitle>
            <S.TextExplain>부담 없이 참여할 수 있는 무료 행사부터<br></br>가치 있는 유료 행사까지 다양하게 준비했어요.</S.TextExplain>
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

export default Step4;

const type = [
    "무료 행사만 볼래요",
    "유료 행사도 괜찮아요",
    "둘 다 좋아요",
]