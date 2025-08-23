// src/pages/MyEvent.jsx
import React, { useState } from "react";
import { Container } from "../../styles/common/styledContainer";
import NavBar from "../../components/Navbar";
import * as E from "../../styles/pages/styledMyEvent";
import PointBar from "../../components/PointBar";
import MyCultureLog from "./MyCultureLog";
import MyReview from "./MyReview";
import useAuthStore from "../../store/useAuthStore";

const MyEvent = () => {
  const [activeTab, setActiveTab] = useState("log");
  const nickname = useAuthStore((s) => s.nickname)

  return (
    <>
      <Container style={{ background: "#282F56" }}>
        <E.Header>
          <E.LvWrapper>
            <h1 style={{marginLeft: "-2px", color: "white"}}>{nickname}</h1>
            <E.LvName>문화시민</E.LvName>
            <PointBar />
          </E.LvWrapper>
        </E.Header>
        <E.Wrapper>
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