import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container } from "../../styles/common/styledContainer";
import { useAreaStore } from "../../store/useInfoStore";
import * as S from "../../styles/pages/styledStep"

const Step3 = () => {
  const { selectedArea, setSelectedArea }= useAreaStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedArea !== null) {
        const timer = setTimeout(() => {
            navigate("/survey/step4");
        }, 500);
        return () => clearTimeout(timer);
    }
  }, [selectedArea, navigate]);

  return (
    <Container style={{background: "linear-gradient(180deg, #FFF 0%, #F0FFF8 100%)"}}>
        <S.StepWrapper>
            <S.StepBar>
                <S.Step3BarFill></S.Step3BarFill>
            </S.StepBar>
            <S.StepNum>
                3 / 4
            </S.StepNum>
        </S.StepWrapper>
        <S.TextWrapper>
            <S.TextTitle>
            어느 지역에서 문화 활동을<br />즐기고 싶으신가요?
            </S.TextTitle>
            <S.TextExplain>원하는 지역을 선택해주세요.<br></br>선택하신 지역 근처의 행사를 추천드릴게요!</S.TextExplain>
        </S.TextWrapper>
        <S.TogetherWrapper>
            {type.map((item, idx) => (
                <S.TogetherItem
                    key={idx}
                    isSelected={selectedArea === idx}
                    onClick={() => setSelectedArea(idx)}
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
    "성북구",
    "동대문구",
    "종로구",
    "강북구",
]