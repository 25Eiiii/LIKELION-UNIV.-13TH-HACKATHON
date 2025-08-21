import styled from "styled-components";

export const Header = styled.div`
  background-image: url(${process.env.PUBLIC_URL}/images/header.svg);
  background-size: cover;
  background-position: center;
  height: 600px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  padding-top: 50px;
  padding-left: 80px;
  border-box: box-sizing;
  max-width: 428px;
  width: 100%;
  p {
    margin: 0px;
    font-family: Pretendard;
    font-style: normal;
    font-weight: 600;
    line-height: normal;
  }
`;

export const Search = styled.div`
width: 349px;
height: 50px;
flex-shrink: 0;
border-radius: 16px;
background: #FFF;
box-shadow: 0 1px 7px 0 rgba(0, 0, 0, 0.20);
display: flex;
align-items: center;
    img {
    margin-left:  20px;
    }
`
export const EntireWrapper = styled.div`
background: #fff;
height: 508px;
flex-shrink: 0;
display: flex;
flex-direction: column;
align-items: center;
z-index: 999;
margin-top: -330px;
position:  relative;
`
export const CategoryWrapper = styled.div`
border-radius: 30px;
width: 512px;
justify-content: center;
display: flex;
flex-direction: column;
align-items: center;
`
export const Question = styled.p`
margin-left: 150px;
margin-bottom: 0;
color: #363636;
font-family: Pretendard;
font-size: 21px;
font-style: normal;
font-weight: 600;
line-height: normal;
width: 100%
`

export const Categories = styled.div`
display: grid;
grid-template-columns: repeat(3, 1fr);
gap: 30px;
margin-top: 30px;
`

export const Item = styled.button`
gap: 12px;
width: 105px;
height: 80px;
flex-shrink: 0;
flex-shrink: 0;
border-radius: 383.458px;
border: none;
background: #FFF;
box-shadow: 0 1px 7px 0 rgba(0, 0, 0, 0.12);
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
color: rgba(0, 0, 0, 0.6);
font-family: Pretendard;
font-size: 14px;
font-style: normal;
font-weight: 600;
line-height: normal;
`

export const RecContainer = styled.div`
display: flex;
justify-content: flex-start;
width: 428px;
flex-shrink: 0;
background: rgba(146, 173, 93, 0.24);
margin-top: 30px;
display: flex;
flex-direction: column;
padding-bottom: 20px;
border-radius: 20px 0px 0px 20px;
margin-left: 70px;
`
export const GoLoginBtns = styled.div`
display: flex;
gap: 14px;
margin-top: 10px;
`
export const GoLoginBox = styled.div`
width: 348px;
height: 213px;
flex-shrink: 0;
border-radius: 18px;
background: #FFF;
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
margin-top: 40px;
color: #838383;
text-align: center;
font-family: Pretendard;
font-style: normal;
line-height: normal;
gap: 10px;
margin-left: 22px;
`
export const LoginBtn = styled.button`
width: 93px;
height: 43px;
flex-shrink: 0;
color: #696969;
text-align: center;
font-family: Pretendard;
font-size: 15px;
font-style: normal;
font-weight: 500;
line-height: normal;
border-radius: 6px;
border: 2px solid #DFDFDF;
background: none;
`
export const SignUpBtn = styled.button`
width: 93px;
height: 43px;
flex-shrink: 0;
color: #696969;
text-align: center;
font-family: Pretendard;
font-size: 15px;
font-style: normal;
font-weight: 500;
line-height: normal;
border-radius: 6px;
border: 2px solid #DFDFDF;
background: none;
`
export const TextWrapper = styled.div`
display: flex;
align-items: center;
justify-content: space-between;
margin-right: 10px;
margin-top: 10px;
`

export const Text = styled.div`
margin-left: 20px;
display: flex;
justify-content: flex-start;
color: #393939;
font-family: Pretendard;
font-size: 18px;
font-style: normal;
font-weight: 600;
line-height: normal;
`
export const MoreBtn = styled.button`
background: none;
border: none;
margin-right: 30px;
display: flex;
align-items: center;
`

export const EventList = styled.div`
margin-left: 20px;
margin-top: 20px;
display: flex;
gap: 16px;
overflow-x: auto;
&::-webkit-scrollbar {
display: none;
`

export const EventItem = styled.div`
display: flex;
flex-direction: column;
align-items: center;
cursor: pointer;
align-items: flex-start;
`

export const EventPost = styled.img`
margin-bottom: 8px;
`

export const EventName = styled.div`
color: #353535;
font-family: Pretendard;
font-size: 13px;
font-style: normal;
font-weight: 600;
line-height: normal;
width: 124px;
`
export const EventDate = styled.div`
color: #404040;
font-family: Pretendard;
font-size: 10px;
font-style: normal;
font-weight: 400;
line-height: normal;
`
export const Chatbot = styled.button`
  position: fixed;
  bottom: 120px;
  left: 140px;
  background: none;
  border: none;
  z-index: 999;
    width: 100%;
`;

export const  Top3 = styled.div`
width: 428px;
margin-top: 30px;
`
export const CultureList = styled.div`
display:  flex;
flex-direction: column;
margin-left: 16px;
margin-top: 30px;
gap: 30px;
padding-bottom: 100px;
`

export const Top3List = styled.div`
display: flex;
align-items: flex-start;
gap: 40px;
p{
margin: 0;
color: #000;
font-family: Pretendard;
font-size: 18px;
font-style: normal;
font-weight: 400;
line-height: normal;
}
`