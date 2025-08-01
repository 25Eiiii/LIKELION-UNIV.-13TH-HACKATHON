import * as H from "../styles/pages/styledHome";
import { Container } from "../styles/common/styledContainer";
import { FiChevronRight } from "react-icons/fi";
import NavBar from "../components/Navbar";

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
            <H.Item>
              공연 / 영화
              <img 
              src={`${process.env.PUBLIC_URL}/images/concert.svg`}
              alt="concert"
            />
            </H.Item>
            <H.Item>
            전시 / 미술
            <img 
              src={`${process.env.PUBLIC_URL}/images/concert.svg`}
              alt="concert"
            />
            </H.Item>
            <H.Item>
            교육 / 체험
            <img 
              src={`${process.env.PUBLIC_URL}/images/concert.svg`}
              alt="concert"
            />
            </H.Item>
            <H.Item>
            축제
            <img 
              src={`${process.env.PUBLIC_URL}/images/concert.svg`}
              alt="concert"
            />
            </H.Item>
            <H.Item>
            도서
            <img 
              src={`${process.env.PUBLIC_URL}/images/concert.svg`}
              alt="concert"
            />
            </H.Item>
            <H.Item>
            역사
            <img 
              src={`${process.env.PUBLIC_URL}/images/concert.svg`}
              alt="concert"
            />
            </H.Item>
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
            <H.EventItem>
              <H.EventPost>
                <img 
              src={`${process.env.PUBLIC_URL}/images/post.svg`}
              alt="concert"
            />
              </H.EventPost>
              <H.EventName>성북동 문화 유산 야행</H.EventName>
              <H.EventDate>2025. 08. 20 - 2025. 08. 27</H.EventDate>
            </H.EventItem>
            <H.EventItem>
              <H.EventPost>
                <img 
              src={`${process.env.PUBLIC_URL}/images/post.svg`}
              alt="concert"
            />
              </H.EventPost>
              <H.EventName>성북동 문화 유산 야행</H.EventName>
              <H.EventDate>2025. 08. 20 - 2025. 08. 27</H.EventDate>
            </H.EventItem>
            <H.EventItem>
              <H.EventPost>
                <img 
              src={`${process.env.PUBLIC_URL}/images/post.svg`}
              alt="concert"
            />
              </H.EventPost>
              <H.EventName>성북동 문화 유산 야행</H.EventName>
              <H.EventDate>2025. 08. 20 - 2025. 08. 27</H.EventDate>
            </H.EventItem>
          </H.EventList>
        </H.RecContainer>
        
        <H.Top3>
            <H.Text>
              이달의 문화 행사 Top3
            </H.Text>
            <H.CultureList>
              <H.CultureItem>
                <H.Number>1</H.Number>
                <H.CulturePost>
                <img 
                src={`${process.env.PUBLIC_URL}/images/post2.svg`}
                alt="concert"
              />
                </H.CulturePost>
                <H.CultureInfo>
                  <H.CultureName>스테이 성북</H.CultureName>
                  <H.CultureDate>2025. 08. 20 - 2025. 08. 27</H.CultureDate>
                </H.CultureInfo>
              </H.CultureItem>
              <H.CultureItem>
                <H.Number>2</H.Number>
                <H.CulturePost>
                <img 
                src={`${process.env.PUBLIC_URL}/images/post2.svg`}
                alt="concert"
              />
                </H.CulturePost>
                <H.CultureInfo>
                  <H.CultureName>스테이 성북</H.CultureName>
                  <H.CultureDate>2025. 08. 20 - 2025. 08. 27</H.CultureDate>
                </H.CultureInfo>
              </H.CultureItem>
              <H.CultureItem>
                <H.Number>3</H.Number>
                <H.CulturePost>
                <img 
                src={`${process.env.PUBLIC_URL}/images/post2.svg`}
                alt="concert"
              />
                </H.CulturePost>
                <H.CultureInfo>
                  <H.CultureName>스테이 성북</H.CultureName>
                  <H.CultureDate>2025. 08. 20 - 2025. 08. 27</H.CultureDate>
                </H.CultureInfo>
              </H.CultureItem>
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