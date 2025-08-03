import styled from "styled-components";
import { useNavigate } from "react-router-dom";

const Header= ({title, img="backbtn.svg"}) => {
  const navigate = useNavigate()

  return (
    <Box>
        <img 
            src={`${process.env.PUBLIC_URL}/images/${img}`} 
            alt="back"
            onClick={() => navigate('/home')}
            />
        <Title>{title}</Title>
    </Box>
  )
}

export default Header;

export const Box = styled.div`
width: 428px;
height: 59px;
flex-shrink: 0;
background: #60C795;
color: #FFF;
font-family: Pretendard;
font-size: 22px;
font-style: normal;
font-weight: 700;
line-height: normal;
display: flex;
align-items:  center;
position: relative;
img {
margin-left: 20px;
}
`
export const Title = styled.p`
position: absolute;
left: 50%;
transform: translateX(-50%);
margin: 0;
`