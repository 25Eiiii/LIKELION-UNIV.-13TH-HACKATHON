import React, { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as D from "../styles/pages/styledDetailInfo";
import { Container } from "../styles/common/styledContainer";
import NavBar from "../components/Navbar";

const DetailInfo = () => {
  const [isClicked, setIsClicked] = useState(false);
  const [isCouponOpen, setIsCouponOpen] = useState(false);
  const infoList = [
    {
      label: "제목 : ",
      value: "2025 성북구립 최만린미술관 개관 기념전 <흙의 숨결>",
    },
    { label: "기간 : ", value: "2025.08.20(목) - 11.28(토) *매주 월 휴관" },
    { label: "시간 : ", value: "10:00 - 19:00" },
    { label: "장소 : ", value: "성북 구립 최만린 미술관 전시실 ( 2F)" },
  ];
  const coupons = [
    "관람 완료 시에 받을 수 있는 쿠폰 목록 받을 수 있는",
    "관람 완료 시에 받을 수 있는 쿠폰 목록 받을 수 있는",
  ];
  const detailList = [
    { label: "관람료 : ", value: "없음(무료)" },
    { label: "관람 연령 : ", value: "전체 관람" },
    { label: "문의 : ", value: "02-717-9997" },
    { label: "상세 정보 : ", value: "http /dbxncjdbf/ djxnwdhufgnd .com" },
  ];
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
  return (
    <>
    <Container>
      <D.InnerWrapper>
        <D.Header>
          <img
            src={`${process.env.PUBLIC_URL}/images/poster.svg`}
            alt="poster"
            width="428px"
          />
          <D.CloudyBox></D.CloudyBox>
          <D.TextBox>
            <D.NameBox>
              <D.Name>흙의 숨결</D.Name>
              <D.Type>전시/미술</D.Type>
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
            <D.EventInfo>
              행사 정보
              <D.MiniLine></D.MiniLine>
            </D.EventInfo>
            <D.Review>참여 후기</D.Review>
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

          <D.DetailInfo>상세 정보</D.DetailInfo>
          <D.DetailBox>
            {detailList.map((item) => (
              <D.InfoTextBox>
                <D.GrayText>{item.label}</D.GrayText>
                <D.BlackText>{item.value}</D.BlackText>
              </D.InfoTextBox>
            ))}
          </D.DetailBox>
        </D.WhiteContainer>
        <D.RecommendBox>
           <D.RecText>
                전시 보면서 방문해보면 어때요?<br/>
                성북 가이드 <span style={{color:"#60C795"}}>부기의 추천 장소 !</span>
           </D.RecText>
           <D.AlarmText>
                <img
                    src={`${process.env.PUBLIC_URL}/images/greencircle.svg`}
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
