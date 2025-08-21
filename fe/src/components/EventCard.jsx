import * as H from "../styles/pages/styledHome";

const EventCard = ({ image, name, date, w, h, onClick }) => {
  const isHttp = (s = "") => /^https?:\/\//i.test(s);
  const src = isHttp(image)
    ? image
    : `${process.env.PUBLIC_URL}/images/${image || "post.svg"}`;

  return (
    <H.EventItem onClick={onClick}>
      <H.EventPost src={src} alt={name} style={{ width: 144, height: 168, borderRadius: 10 }} />
      <H.EventName>{name}</H.EventName>
      <H.EventDate>{date}</H.EventDate>
    </H.EventItem>
  );
};

export default EventCard;
