import * as H from "../styles/pages/styledHome";
import { Container } from "../styles/common/styledContainer";
import { FiChevronRight } from "react-icons/fi";
import NavBar from "../components/Navbar";
import EventCard from "../components/EventCard";
import Top3Card from "../components/Top3Card";

const categories = [
  { label: "공연 / 영화", image: "concert.svg" },
  { label: "전시 / 미술", image: "art.svg" },
  { label: "교육 / 체험", image: "edu.svg" },
  { label: "축제", image: "festival.svg" },
  { label: "도서", image: "book.svg" },
  { label: "역사", image: "history.svg" },
];

export const recommendedEvents = [
  {
    name: "성북동 문화 유산 야행",
    date: "2025. 08. 20 - 2025. 08. 27",
    image: "post.svg",
  },
  {
    name: "청춘 마이크 페스티벌",
    date: "2025. 09. 01 - 2025. 09. 03",
    image: "post.svg",
  },
  {
    name: "도심 속 문화 나들이",
    date: "2025. 09. 10 - 2025. 09. 17",
    image: "post.svg",
  },
];

// data/topCultures.js
export const topEvents = [
  {
    rank: 1,
    name: "스테이 성북",
    date: "2025. 08. 20 - 2025. 08. 27",
    image: "post2.svg",
  },
  {
    rank: 2,
    name: "청춘 음악회",
    date: "2025. 08. 28 - 2025. 09. 01",
    image: "post2.svg",
  },
  {
    rank: 3,
    name: "문화가 있는 날",
    date: "2025. 09. 02 - 2025. 09. 08",
    image: "post2.svg",
  },
];


const Home = () => {
  return (
    <>
    <Container>
      <H.Header>
        <p style={{ fontSize: "20px", color: "#fff"}}>
        효민님은 문화 시민
        </p>
        <p style={{ fontSize: "38px",  color: "#fff"}}>
        Lv. 5
        </p>
        <p style={{ fontSize: "20px", color: "#fff" }}>
        이번 주 한 번 더 참여하면 <br /> <span style={{ color: "#FFA90E" }}>300</span> 
        <img style={{ marginLeft: "8px", marginRight: "8px" }} 
            src={`${process.env.PUBLIC_URL}/images/point.png`}
            alt="search"
          />
        추가 적립!
        </p>
      </H.Header>
      <H.EntireWrapper>
        <H.Search>
          <img 
            src={`${process.env.PUBLIC_URL}/images/search.svg`}
            alt="search"
          />
        </H.Search>
        <H.CategoryWrapper>
          <H.Question>
            어떤 문화 활동을 찾고 계신가요?
          </H.Question>
          <H.Categories>
            {categories.map((cat, idx) => (
              <H.Item key={idx}>
                {cat.label}
                <img 
                  src={`${process.env.PUBLIC_URL}/images/${cat.image}`}
                  alt="concert"
                />
              </H.Item>
            ))}
          </H.Categories>
        </H.CategoryWrapper>
        <H.RecContainer>
          <H.TextWrapper>
            <H.Text>
              효민님을 위한 추천 전시 / 행사
            </H.Text>
            <H.MoreBtn>
              더보기 <FiChevronRight></FiChevronRight>
            </H.MoreBtn>
          </H.TextWrapper>
          <H.EventList>
            {recommendedEvents.map((event, idx) => (
              <EventCard key={idx} {...event} />
            ))}
          </H.EventList>
        </H.RecContainer>
        
        <H.Top3>
            <H.Text>
              이달의 문화 행사 Top3
            </H.Text>
            <H.CultureList>
              {topEvents.map((event, idx) => (
                <Top3Card key={idx} {...event}/>
              ))}
            </H.CultureList>
          </H.Top3>
      </H.EntireWrapper>

        
    </Container>
    <H.Chatbot>
          <img 
              src={`${process.env.PUBLIC_URL}/images/chatbot.svg`}
              alt="search"
            />
    </H.Chatbot>
    <NavBar />
    </>
  )
}

export default Home;