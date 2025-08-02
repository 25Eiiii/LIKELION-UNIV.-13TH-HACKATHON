import * as H from "../styles/pages/styledHome";

const EventCard = ({ name, date, image, w=144, h=168 }) => (
  <H.EventItem>
    <H.EventPost>
      <img 
      src={`${process.env.PUBLIC_URL}/images/${image}`} 
      alt={name}
      width={w}
      height={h}
      />
    </H.EventPost>
    <H.EventName>{name}</H.EventName>
    <H.EventDate>{date}</H.EventDate>
  </H.EventItem>
);

export default EventCard;