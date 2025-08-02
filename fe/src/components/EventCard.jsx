import * as H from "../styles/pages/styledHome";

const EventCard = ({ name, date, image }) => (
  <H.EventItem>
    <H.EventPost>
      <img src={`${process.env.PUBLIC_URL}/images/${image}`} alt={name} />
    </H.EventPost>
    <H.EventName>{name}</H.EventName>
    <H.EventDate>{date}</H.EventDate>
  </H.EventItem>
);

export default EventCard;