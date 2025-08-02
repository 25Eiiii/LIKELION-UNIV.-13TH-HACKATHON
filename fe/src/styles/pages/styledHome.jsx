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
width: 428px;
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
font-size: 15px;
font-style: normal;
font-weight: 600;
line-height: normal;
`

export const RecContainer = styled.div`
display: flex;
justify-content: flex-start;
width: 428px;
height: 322px;
flex-shrink: 0;
background: rgba(146, 173, 93, 0.24);
margin-top: 30px;
display: flex;
flex-direction: column;
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
`

export const EventList = styled.div`
margin-left: 40px;
margin-top: 20px;
display: flex;
gap: 15px;
overflow-x: auto;
&::-webkit-scrollbar {
display: none;
`

export const EventItem = styled.div`
display: flex;
flex-direction: column;
`

export const EventPost = styled.div`

`

export const EventName = styled.div`
color: #353535;
font-family: Pretendard;
font-size: 13px;
font-style: normal;
font-weight: 600;
line-height: normal;
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
margin-left: 30px;
margin-top: 30px;
gap: 30px;
`
export const CultureItem = styled.div`
display: flex;
gap: 30px;
`
export const Number = styled.div`

`
export const CulturePost = styled.div`

`
export const CultureInfo = styled.div`
display: flex;
flex-direction: column;
gap: 10px;
`
export const CultureName = styled.div`

`
export const CultureDate = styled.div`

`