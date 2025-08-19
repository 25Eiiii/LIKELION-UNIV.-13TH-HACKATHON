import styled from "styled-components";

const EventCardS = ({ main_img, title, date_text, place, onClick }) => {
  const isHttp = (s = "") => /^https?:\/\//i.test(s);
  const src = isHttp(main_img)
    ? main_img
    : `${process.env.PUBLIC_URL}/images/${main_img || "post.svg"}`;

  return (
    <CultureItem onClick={onClick}>
      <CultureThumbnail src={src} alt={title} />
      <CultureInfo>
        <CultureTitle>{title}</CultureTitle>
        <CultureDate>{date_text}</CultureDate>
        <CultureLocation>{place}</CultureLocation>
      </CultureInfo>
    </CultureItem>
  );
};

export default EventCardS;


export const CultureItem = styled.div`
  display: flex;
  gap: 30px;
  cursor: pointer;
`;
export const CultureThumbnail = styled.img`
  width: 93px;
  height: 127px;
  flex-shrink: 0;
  object-fit: cover;
  border-radius: 6px;
`;
export const CultureInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;
export const CultureTitle = styled.div`
  color: #353535;
  font-family: Pretendard;
  font-size: 17px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  width: 180px;
`;
export const CultureDate = styled.div`
  color: #404040;
  font-family: Pretendard;
  font-size: 13px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
`;
export const CultureLocation = styled.div`
  color: #848484;
  font-family: Pretendard;
  font-size: 13px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  width: 180px;
`;
