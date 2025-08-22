import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as L from "../styles/pages/styledLogin";
import { Container } from "../styles/common/styledContainer";
import axios from "axios";
import useAuthStore from "../store/useAuthStore";
import { jwtDecode } from "jwt-decode";

const Login = () => {
    const navigate = useNavigate();
    const [id,setId] = useState("");
    const [password,setPassword] = useState("");
    const [error,setError] = useState(null);
    const { login } = useAuthStore();

    const goLogin = async() => {
        try{
            const response = await axios.post(
                "/api/accounts/login/",
                
                {
                    username: id,
                    password: password
                },
                {
                    headers:{
                        "Content-Type": "application/json",
                    },
                },
            );

            const { access, nickname } = response.data;

            const decodedToken = jwtDecode(access);

            const userId = decodedToken.user

            login(access, userId, nickname);
            

            console.log("token: ", access);
            console.log("user id:", userId);
            console.log("nickname:", nickname);
            console.log("dta:", response.data);
            localStorage.setItem("accessToken", response.data.access);
            localStorage.setItem("refreshToken",response.data.refresh);
            navigate("/home");
        }catch(error){
            console.log(error.response);
            setError("아이디 또는 비밀번호를 다시 확인해주세요");
        }
    };
    return(
        <>
        <Container>
            <L.InnerWrapper>
                <L.BackGround>
                     <img src={`${process.env.PUBLIC_URL}/images/background.svg`} />
                </L.BackGround>
                <L.Logo>
                    <img src={`${process.env.PUBLIC_URL}/images/logo.svg`}/>
                </L.Logo>
                <L.Id
                    placeholder="아이디"
                    value={id}
                    onChange={(e)=>{
                        setId(e.target.value);
                        setError(null);
                    }}
                    style={{
                        border: error !== null ? "2px solid #EF4452" : "2px solid #D9D9D9"
                    }}
                />
                <L.Password
                    placeholder="비밀번호"
                    type="password"
                    value={password}
                    onChange={(e)=>{
                        setPassword(e.target.value);
                        setError(null);
                    }}
                    style={{
                        border: error !== null ? "2px solid #EF4452" : "2px solid #D9D9D9"
                    }}
                />
                <L.Error style={{
                    visibility: error !== null ? "visible" : "hidden"
                    
                }}>{error}</L.Error>
                <L.Login onClick={goLogin}>
                    로그인
                </L.Login>
                <L.SignUp onClick={()=>navigate("/signup")}>
                    회원가입
                </L.SignUp>                
                
            </L.InnerWrapper>
        </Container>
        </>

    );
};

export default Login;