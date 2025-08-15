import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as N from "../styles/common/styledNavbar";

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <N.NavWrapper>
        <N.Line></N.Line>
        <N.Group>
            <N.Icon onClick={() => navigate("/home")}>
                <img
                    id="home"
                    src={`${process.env.PUBLIC_URL}/images/${
                        location.pathname === "/home" ? "home_active.svg" : "home.svg"
                    }`}
                    alt="home"
                    style={{width: "35px", height: "35px", marginBottom: "-3px", marginTop: "-3px"}}
                />
                홈
            </N.Icon>
            <N.Icon onClick={() => navigate("/search")}>
                <img
                    id="explore"
                    src={`${process.env.PUBLIC_URL}/images/${
                        location.pathname === "/search" ? "explore_active.svg" : "explore.svg"
                    }`}
                    alt="explore"
                /> 
                탐색
            </N.Icon>
            <N.Icon onClick={() => navigate("/coupon")}>
                <img
                    id="coupon"
                    src={`${process.env.PUBLIC_URL}/images/${
                        location.pathname === "/coupon" ? "coupon_active.svg" : "coupon.svg"
                    }`}
                    alt="coupon"
                />
                혜택
            </N.Icon>
            <N.Icon onClick={() => navigate("/likes")}>
                <img
                    id="like"
                    src={`${process.env.PUBLIC_URL}/images/${
                        location.pathname === "/likes" ? "like_active.svg" : "like.svg"
                    }`}
                    alt="like"
                />
                좋아요
            </N.Icon>
            <N.Icon onClick={() => navigate("/mypage-myevent")}>
                <img
                    id="mypage"
                    src={`${process.env.PUBLIC_URL}/images/${
                        location.pathname === "/mypage-myevent" ? "mypage_active.svg" : "mypage.svg"
                    }`}
                    alt="mypage"
                />
                마이페이지
            </N.Icon>
        </N.Group>
    </N.NavWrapper>
  );
};

export default NavBar;