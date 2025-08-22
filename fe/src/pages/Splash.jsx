import React, {useEffect } from "react";
import { useNavigate,} from "react-router-dom";
import * as S from "../styles/pages/styledSplash";
import { Container } from "../styles/common/styledContainer";

const Splash = () => {
  const navigate = useNavigate();

  useEffect(()=>{
    const t = setTimeout(()=>{
      navigate("/home",{replace:true});
    },2000);
    return () => clearTimeout(t);
  },[])
  return (
    <Container>
      <S.Splash
        src={`${process.env.PUBLIC_URL}/images/splash.svg`}
        alt="splash"
      />
    </Container>
  );
};
export default Splash;
