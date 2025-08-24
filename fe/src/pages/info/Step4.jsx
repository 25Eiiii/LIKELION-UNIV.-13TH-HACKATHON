import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container } from "../../styles/common/styledContainer";
import { useFeeStore } from "../../store/useInfoStore";
import useInterestStore from "../../store/useInfoStore";
import { useAreaStore } from "../../store/useInfoStore";
import { useTogetherStore } from "../../store/useInfoStore";
import useCreateProfile from "../../hooks/useCreateProfile";
import * as S from "../../styles/pages/styledStep"

const Step4 = () => {
  const { selectedInterests, toggleInterest }= useInterestStore();
  const { selectedArea, setSelectedArea }= useAreaStore();
  const { selectedTogether, setSelectedTogether }= useTogetherStore();
  const { selectedFee, setSelectedFee }= useFeeStore();
  const navigate = useNavigate();

  const { mutate, isSuccess, isError, isLoading } = useCreateProfile();

  useEffect(() => {
    if (selectedFee !== null) {
      const profileData = {
        interests: selectedInterests.map(idx => interestsData[idx].name),
        together: togetherData[selectedTogether],
        area: area[selectedArea],
        fee_type: type[selectedFee]
      };
      console.log("보내는 데이터:", profileData);
      mutate(profileData);
    }
  }, [selectedFee]); 
  
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        navigate("/home");
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, navigate]);
  

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
                    isSelected={selectedFee === idx}
                    onClick={() => setSelectedFee(idx)}
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

const area = [
    "성북구",
    "동대문구",
    "종로구",
    "강북구"
]


const interestsData = [
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
];

const togetherData = [
    "혼자서",
    "친구와",
    "연인과",
    "가족과",
    "반려동물과"
];