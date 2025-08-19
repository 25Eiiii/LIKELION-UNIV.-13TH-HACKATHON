// src/pages/MyEvent.jsx
import React, { useState } from "react";
import { Container } from "../../styles/common/styledContainer";
import NavBar from "../../components/Navbar";
import * as E from "../../styles/pages/styledMyEvent";
import PointBar from "../../components/PointBar";
import MyCultureLog from "./MyCultureLog";
import MyReview from "./MyReview";

const MyEvent = () => {
  const [activeTab, setActiveTab] = useState("log");

  return (
    <>
      <Container style={{ background: "#282F56" }}>
        <E.Header>
          <E.LvWrapper>
            <E.LvName>문화시민</E.LvName>
            <E.Lv>Lv. 3</E.Lv>
            <PointBar />
          </E.LvWrapper>
        </E.Header>

        <E.Wrapper>
          <E.Tab>
            <E.Item>
              <E.Circle style={{ background: "rgba(228, 243, 242, 1)" }}>
                <img src={`${process.env.PUBLIC_URL}/images/tab1.svg`} alt="tab" />
              </E.Circle>
              인증하기
            </E.Item>

            <E.Item>
              <E.Circle style={{ background: "rgba(251, 239, 231, 1)" }}>
                <img src={`${process.env.PUBLIC_URL}/images/tab2.svg`} alt="tab" />
              </E.Circle>
              쿠폰 사용
            </E.Item>

            <E.Item>
              <E.Circle style={{ background: "rgba(254, 243, 205, 1)" }}>
                <img src={`${process.env.PUBLIC_URL}/images/tab3.svg`} alt="tab" />
              </E.Circle>
              내 일정
            </E.Item>

            <E.Item>
              <E.Circle style={{ background: "rgba(229, 244, 242, 1)" }}>
                <img src={`${process.env.PUBLIC_URL}/images/tab4.png`} alt="tab" />
              </E.Circle>
              나의 업적
            </E.Item>

            <E.Item>
              <E.Circle style={{ background: "rgba(222, 232, 243, 1)" }}>
                <img src={`${process.env.PUBLIC_URL}/images/tab5.svg`} alt="tab" />
              </E.Circle>
              도움말
            </E.Item>
          </E.Tab>

          <E.Tab2>
            <E.Tab2Item
              isActive={activeTab === "log"}
              onClick={() => setActiveTab("log")}
            >
              내 문화 기록
            </E.Tab2Item>
            <E.Tab2Item
              isActive={activeTab === "review"}
              onClick={() => setActiveTab("review")}
            >
              나의 후기
            </E.Tab2Item>
          </E.Tab2>

          {activeTab === "log" ? <MyCultureLog /> : <MyReview />}
        </E.Wrapper>
      </Container>
      <NavBar />
    </>
  );
};

export default MyEvent;
