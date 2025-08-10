import styled from "styled-components"

const EventCardS = ({thumbnail, title, date, location}) => (
  <CultureItem>
    <CultureThumbnail 
      src={`${process.env.PUBLIC_URL}/images/${thumbnail}`}
      alt={title}
    />
    <CultureInfo>
        <CultureTitle>{title}</CultureTitle>
        <CultureDate>{date}</CultureDate>
        <CultureLocation>{location}</CultureLocation>
    </CultureInfo>
  </CultureItem>
);

export default EventCardS;

export const CultureItem = styled.div`
display: flex;
gap: 30px;
`
export const CultureThumbnail = styled.img`
width: 93px;
height: 127px;
flex-shrink: 0;
`
export const CultureInfo = styled.div`
display: flex;
flex-direction: column;
gap: 10px;
`
export const CultureTitle = styled.div`
color: #353535;
font-family: Pretendard;
font-size: 17px;
font-style: normal;
font-weight: 600;
line-height: normal;
`
export const CultureDate = styled.div`
color: #404040;
font-family: Pretendard;
font-size: 13px;
font-style: normal;
font-weight: 400;
line-height: normal;
`

export const CultureLocation = styled.div`
color: #848484;
font-family: Pretendard;
font-size: 13px;
font-style: normal;
font-weight: 400;
line-height: normal;
`