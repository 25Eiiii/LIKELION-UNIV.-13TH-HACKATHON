import * as H from "../styles/pages/styledHome"

const Top3Card = ({rank, name, date, image}) => (
  <H.CultureItem>
    <H.Number>{rank}</H.Number>
    <H.CulturePost>
    <img 
        src={`${process.env.PUBLIC_URL}/images/${image}`}
        alt={name}
    />
    </H.CulturePost>
    <H.CultureInfo>
        <H.CultureName>{name}</H.CultureName>
        <H.CultureDate>{date}</H.CultureDate>
    </H.CultureInfo>
  </H.CultureItem>
);

export default Top3Card;