import React from 'react';
import { Container } from '../../styles/common/styledContainer';
import NavBar from '../../components/Navbar';
import  * as E from '../../styles/pages/styledMyEvent'
import PointBar from '../../components/PointBar';

const MyEvent = () => {
  return (
    <>
    <Container style={{background: "#282F56"}}>
        <E.Header>
            <E.LvWrapper>
                <E.LvName>문화시민</E.LvName>
                <E.Lv>Lv. 3</E.Lv>
                <PointBar currentPoint={2244}></PointBar>
            </E.LvWrapper>
        </E.Header>
        <E.Wrapper>
            <E.Tab>
                <E.Item>
                    <E.Circle style={{background: "rgba(228, 243, 242, 1)"}}>
                    <img src={`${process.env.PUBLIC_URL}/images/tab1.svg`} alt="tab" />
                    </E.Circle>
                    인증하기
                </E.Item><E.Item>
                    <E.Circle style={{background: "rgba(251, 239, 231, 1)"}}>
                    <img src={`${process.env.PUBLIC_URL}/images/tab2.svg`} alt="tab" />
                    </E.Circle>
                    인증하기
                </E.Item>
                <E.Item>
                    <E.Circle style={{background: "rgba(254, 243, 205, 1)"}}>
                    <img src={`${process.env.PUBLIC_URL}/images/tab3.svg`} alt="tab" />
                    </E.Circle>
                    인증하기
                </E.Item>
                <E.Item>
                    <E.Circle style={{background: "rgba(229, 244, 242, 1)"}}>
                    <img src={`${process.env.PUBLIC_URL}/images/tab4.png`} alt="tab" />
                    </E.Circle>
                    인증하기
                </E.Item>
                <E.Item>
                    <E.Circle style={{background: "rgba(222, 232, 243, 1)"}}>
                    <img src={`${process.env.PUBLIC_URL}/images/tab5.svg`} alt="tab" />
                    </E.Circle>
                    인증하기
                </E.Item>
            </E.Tab>
        </E.Wrapper>
    </Container>
    <NavBar />
    </>
  )
};

export default MyEvent;