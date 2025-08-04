import React, { useState,useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as D from "../styles/pages/styledDetailInfo";
import { Container } from "../styles/common/styledContainer";
import NavBar from "../components/Navbar";
import axios from "axios";

const DetailInfo = () => {
  const [isClicked, setIsClicked] = useState(false);
  const [isCouponOpen, setIsCouponOpen] = useState(false);
  const [data,setData] = useState(null);
  const {id} = useParams()||{id:3};

  useEffect(()=>{
    console.log("id: ",id);
    const fetchdata = async()=>{
        try{
            const response = await axios.get(
                `/api/details/detail/3/`
            );
            console.log("응답 데이터: ",response.data);
            setData(response.data);
        }catch(error){
            console.error("데이터 불러오기 실패: ",error);
            if(error.response){
                console.error("서버 응답: ", error.response);
            }
        }
    }
    fetchdata();
  },[id]);
  const infoList =  data
   ? [
    
    { label: "제목 : ", value: data.title},
    { label: "기간 : ", value: data.date},
    { label: "장소 : ", value: data.place },
    { label: "신청일 : ", value: data.rgst_date },
  ]
  : [];
  const coupons = [
    "관람 완료 시에 받을 수 있는 쿠폰 목록 받을 수 있는",
    "관람 완료 시에 받을 수 있는 쿠폰 목록 받을 수 있는",
  ];
  const detailList = data ?
   [
    { label: "관람료 : ", value: data.use_fee },
    { label: "관람 연령 : ", value: data.use_trgt },
    { label: "관련 정보 : ", value: data.hmpg_addr },
  ]
  : [];
  const stores = [
    {
        name:"제휴 가게명",
        image: "/images/store.svg",
        link: ""
    },
    {
        name:"제휴 가게명",
        image: "/images/store.svg",
        link: ""
    },
    {
        name:"제휴 가게명",
        image: "/images/store.svg",
        link: ""
    },
    {
        name:"제휴 가게명",
        image: "/images/store.svg",
        link: ""
    },
  ];
  const navigate = useNavigate();
  const goReview = () =>{
    navigate("/detailReview")
  };
  return (
    <>
    <Container>
      <D.InnerWrapper>
        <D.Header>
          <img
            src={data?.main_img}
            alt="poster"
            width="428px"
          />
          <D.CloudyBox></D.CloudyBox>
          <D.TextBox>
            <D.NameBox>
              <D.Name>{data?.title}</D.Name>
              <D.Type>{data?.codename}</D.Type>
            </D.NameBox>
            <D.Explain>
              성북구의 공공미술관으로 조성되어 대중의 품 안에 자리하게 된
              성북구립 최만린미술관이 정식 개관을 맞아 &lt;흙의 숨결&gt; 전을
              개최합니다.
            </D.Explain>
            {isClicked ? (
              <D.Heart
                src={`${process.env.PUBLIC_URL}/images/fullheart.svg`}
                alt="heart"
                onClick={() => setIsClicked(false)}
              />
            ) : (
              <D.Heart
                src={`${process.env.PUBLIC_URL}/images/blankheart.svg`}
                alt="blankheart"
                onClick={() => setIsClicked(true)}
              />
            )}

            <D.Share
              src={`${process.env.PUBLIC_URL}/images/share.svg`}
              alt="share"
            />
          </D.TextBox>
        </D.Header>
        <D.WhiteContainer>
          <D.Tab>
            <D.EventInfo style={{cursor:"default"}}>
              행사 정보
              <D.MiniLine></D.MiniLine>
            </D.EventInfo>
            <D.Review onClick={goReview} style={{cursor:"pointer"}}>참여 후기</D.Review>
          </D.Tab>
          <D.Line></D.Line>
          <D.BasicInfo>기본 정보</D.BasicInfo>
          <D.BasicGrayBox>
            {infoList.map((item) => (
              <D.InfoTextBox>
                <D.GrayText>{item.label}</D.GrayText>
                <D.BlackText>{item.value}</D.BlackText>
              </D.InfoTextBox>
            ))}
          </D.BasicGrayBox>

           <D.DetailInfo>상세 정보</D.DetailInfo>
          <D.DetailBox>
            {detailList.map((item) => (
              <D.InfoTextBox>
                <D.GrayText>{item.label}</D.GrayText>
                <D.BlackText>{item.value}</D.BlackText>
              </D.InfoTextBox>
            ))}
          </D.DetailBox>

          <D.Benefit>받을 수 있는 혜택</D.Benefit>
          <D.CouponBox>
            <D.CouponTitle>
              쿠폰
              <img
                src={`${process.env.PUBLIC_URL}/images/dropdown.svg`}
                alt="dropdown"
                style={{ marginLeft: "8px" }}
                onClick={() => setIsCouponOpen((prev) => !prev)}
              />
            </D.CouponTitle>
          </D.CouponBox>

          {isCouponOpen && (
            <D.CouponList>
              {coupons.map((text, index) => (
                <>
                  <D.CouponItem>
                    {text}
                    <img
                      src={`${process.env.PUBLIC_URL}/images/lock.svg`}
                      alt="lock"
                      style={{ marginRight: "12px" }}
                    />
                  </D.CouponItem>
                  {index < coupons.length - 1 && <D.CouponLine></D.CouponLine>}
                </>
              ))}
            </D.CouponList>
          )}

          <D.PointBox>
            <D.PointTitle>포인트</D.PointTitle>
            <D.PointLine></D.PointLine>
            <D.Point>290p</D.Point>
          </D.PointBox>

         
        </D.WhiteContainer>
        <D.RecommendBox>
           <D.RecText>
                전시 보면서 방문해보면 어때요?<br/>
                성북 가이드 <span style={{color:"#60C795"}}>부기의 추천 장소 !</span>
           </D.RecText>
           <D.AlarmText>
                <img
                    src={`${process.env.PUBLIC_URL}/images/greenalarm.svg`}
                    alt="greencircle"
                    style={{marginRight:"6px"}}                   
                />
                매장에서 제휴 쿠폰을 사용 할 수 있어요
           </D.AlarmText>
           <D.RecommendList>
             {stores.map((store)=>(
                <D.StoreBox>
                    <img
                        src={store.image}
                        alt={store.name}
                    />
                    <D.StoreText>
                        {store.name}<a href={store.link} style={{color:"#FFF",textDecoration:"none",fontSize:"10px", marginLeft:"5px",fontWeight:"500",display:"inline-block"}}>바로가기 &gt;</a>
                    </D.StoreText>
                </D.StoreBox>
             ))}
           </D.RecommendList>
        </D.RecommendBox>
      </D.InnerWrapper>
    </Container>
    <NavBar></NavBar>
    </>
  );
};

export default DetailInfo;
