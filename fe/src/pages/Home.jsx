import * as H from "../styles/pages/styledHome";
import { Container } from "../styles/common/styledContainer";
import { FiChevronRight } from "react-icons/fi";
import NavBar from "../components/Navbar";
import EventCard from "../components/EventCard";
import EventCardS from "../components/EventCardS";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import { useTopEvents, useTop3Monthly } from "../hooks/useRec";

const categories = [
  { label: "무대 / 공연", image: "concert.svg" },
  { label: "전시 / 미술", image: "art.svg" },
  { label: "교육 / 체험", image: "edu.svg" },
  { label: "축제", image: "festival.svg" },
  { label: "음악 / 콘서트", image: "music.svg" },
  { label: "기타", image: "etc.svg" },
];

const Home = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { data: events = [], isLoading, error } = useTopEvents(10);
  const { data: top3 = [], isLoading: loadingTop3, error: errorTop3 } = useTop3Monthly();

  return (
    <>
      <Container>
        <H.Header>
          <p style={{ fontSize: "20px", color: "#fff" }}>
            {user ? `${user.nickname}님은 문화 시민` : "문화시민"}
          </p>
          <p style={{ fontSize: "38px", color: "#fff" }}>Lv. 5</p>
          <p style={{ fontSize: "20px", color: "#fff" }}>
            이번 주 한 번 더 참여하면 <br /> <span style={{ color: "#FFA90E" }}>300</span>
            <img
              style={{ marginLeft: "8px", marginRight: "8px" }}
              src={`${process.env.PUBLIC_URL}/images/point.png`}
              alt="search"
            />
            추가 적립!
          </p>
        </H.Header>

        <H.EntireWrapper>
          <H.Search>
            <img src={`${process.env.PUBLIC_URL}/images/search.svg`} alt="search" />
          </H.Search>

          <H.CategoryWrapper>
            <H.Question>어떤 문화 활동을 찾고 계신가요?</H.Question>
            <H.Categories>
              {categories.map((cat, idx) => (
                <H.Item
                  key={idx}
                  onClick={() => navigate(`/category?category=${encodeURIComponent(cat.label)}`)}
                >
                  {cat.label}
                  <img src={`${process.env.PUBLIC_URL}/images/${cat.image}`} alt="concert" />
                </H.Item>
              ))}
            </H.Categories>
          </H.CategoryWrapper>

          <H.RecContainer>
            <H.TextWrapper>
              <H.Text>효민님을 위한 추천 전시 / 행사</H.Text>
              <H.MoreBtn>
                더보기 <FiChevronRight />
              </H.MoreBtn>
            </H.TextWrapper>

            {isLoading && <p style={{ marginLeft: 20 }}>로딩중…</p>}

            {error && (
              <H.GoLoginBox>
                <p style={{ fontSize: "20px", fontWeight: 600, margin: 0 }}>
                  로그인이 필요한 서비스입니다.
                </p>
                <p style={{ fontSize: "15px", fontWeight: 500, margin: 0 }}>
                  맞춤형 추천 행사를 확인하시려면
                  <br />
                  로그인하세요.
                </p>
                <H.GoLoginBtns>
                  <H.LoginBtn onClick={() => navigate("/login")}>로그인</H.LoginBtn>
                  <H.SignUpBtn onClick={() => navigate("/login")}>회원가입</H.SignUpBtn>
                </H.GoLoginBtns>
              </H.GoLoginBox>
            )}

            {!isLoading && !error && (
              <H.EventList>
                {events.length === 0 && <p style={{ marginLeft: 20 }}>추천 데이터가 없습니다.</p>}
                {events.map((event) => (
                  <EventCard
                    key={event.id}
                    name={event.title}
                    date={event.date_text}
                    image={event.main_img}
                    onClick={() => navigate(`/detailInfo/${event.id}`)}
                  />
                ))}
              </H.EventList>
            )}
          </H.RecContainer>

          <H.Top3>
            <H.Text>이달의 문화 행사 Top3</H.Text>

            {loadingTop3 && <p style={{ marginLeft: 20 }}>로딩중..</p>}
            {errorTop3 && <p style={{ marginLeft: 20 }}>불러오기 실패</p>}
            {!loadingTop3 && !errorTop3 && (
              <H.CultureList>
                {top3.length === 0 && <p style={{ marginLeft: 20 }}>데이터 없음</p>}
                
                {top3.map((event, idx) => (
                  <H.Top3List key={event.id ?? idx}>
                    <p>{idx + 1}</p>
                    <EventCardS
                      key={event.id ?? idx}
                      title={event.title}
                      date_text={event.date_text}
                      main_img={event.main_img}
                      place={event.place}
                      onClick={() => navigate(`/detailInfo/${event.id}`)}
                    />
                  </H.Top3List>
                ))}
              </H.CultureList>
            )}
          </H.Top3>
        </H.EntireWrapper>
      </Container>

      <H.Chatbot>
        <img
          src={`${process.env.PUBLIC_URL}/images/chatbot.svg`}
          alt="search"
          onClick={() => navigate("/chatbot-intro")}
        />
      </H.Chatbot>

      <NavBar />
    </>
  );
};

export default Home;
