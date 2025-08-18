import * as H from "../styles/pages/styledHome";
import { Container } from "../styles/common/styledContainer";
import { FiChevronRight } from "react-icons/fi";
import NavBar from "../components/Navbar";
import EventCard from "../components/EventCard";
import EventCardS from "../components/EventCardS";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import { useTopEvents } from "../hooks/useTopEvents";

const categories = [
  { label: "무대 / 공연", image: "concert.svg" },
  { label: "전시 / 미술", image: "art.svg" },
  { label: "교육 / 체험", image: "edu.svg" },
  { label: "축제", image: "festival.svg" },
  { label: "음악 / 콘서트", image: "book.svg" },
  { label: "기타", image: "history.svg" },
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

export const topEvents = [
  {
    title: "스테이 성북",
    date: "2025. 08. 20 - 2025. 08. 27",
    thumbnail: "post2.svg",
    location: "서울 문화 예술 교육 센터"
  },
  {
    title: "한옥 쉼표, 싱잉볼 테라피",
    date: "2025. 08. 20 - 2025. 08. 27",
    thumbnail: "post3.svg",
    location: "서울 문화 예술 교육 센터"
  },
  {
    title: "문화가 있는 날",
    date: "2025. 09. 02 - 2025. 09. 08",
    thumbnail: "post2.svg",
    location: "서울 문화 예술 교육 센터"
  },
];


const Home = () => {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user);
  const { data, isLoading } = useTopEvents("2025-08", 3)

  return (
    <>
    <Container>
      <H.Header>
        <p style={{ fontSize: "20px", color: "#fff"}}>
        {user ? `${user.nickname}님은 문화 시민`: "문화시민"}
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
              <H.Item 
                key={idx}
                onClick={() => navigate(`/category?category=${encodeURIComponent(cat.label)}`)}
                >
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
                <H.Top3List>
                  <p>{idx+1}</p>
                  <EventCardS key={idx} rank={idx+1} name={event.title} date={event.date_text} image={event.main_img}/>
                </H.Top3List>
              ))}
            </H.CultureList>
          </H.Top3>
      </H.EntireWrapper>

    </Container>
    <H.Chatbot onClick={() => navigate('/chatbot-intro')}>
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