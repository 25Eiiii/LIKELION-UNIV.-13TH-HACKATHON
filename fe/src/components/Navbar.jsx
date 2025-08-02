import React from "react";
import { useNavigate } from "react-router-dom";
import * as N from "../styles/common/styledNavbar";

const NavBar = () => {
  const navigate = useNavigate()

  return (
    <N.NavWrapper>
        <N.Line></N.Line>
        <N.Group>
            <N.Icon onClick={() => navigate("/home")}>
                <img
                    id="home"
                    src={`${process.env.PUBLIC_URL}/images/home.svg`}
                    alt="home"
                />
                홈
            </N.Icon>
            <N.Icon onClick={() => navigate("/explore-list")}>
                <img
                    id="explore"
                    src={`${process.env.PUBLIC_URL}/images/explore.svg`}
                    alt="explore"
                /> 
                탐색
            </N.Icon>
            <N.Icon onClick={() => navigate("/community/mentoring")}>
                <img
                    id="reserve"
                    src={`${process.env.PUBLIC_URL}/images/reserve.svg`}
                    alt="reserve"
                />
                예약
            </N.Icon>
            <N.Icon onClick={() => navigate("/scrap")}>
                <img
                    id="like"
                    src={`${process.env.PUBLIC_URL}/images/like.svg`}
                    alt="like"
                />
                좋아요
            </N.Icon>
            <N.Icon onClick={() => navigate("/profile")}>
                <img
                    id="mypage"
                    src={`${process.env.PUBLIC_URL}/images/mypage.svg`}
                    alt="mypage"
                />
                마이페이지
            </N.Icon>
        </N.Group>
    </N.NavWrapper>
  );
};

export default NavBar;