import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import * as C from "../styles/pages/styledCategory";
import { Container } from "../styles/common/styledContainer";
import NavBar from "../components/Navbar";
import axios from "axios";

const Category = () => {
  const categoryList = [
    { label: "전체", query: "" },
    { label: "무대/공연", query: "무대/공연" },
    { label: "전시/미술", query: "전시/미술" },
    { label: "교육/체험", query: "교육/체험" },
    { label: "축제", query: "축제" },
    { label: "음악/콘서트", query: "음악/콘서트" },
    { label: "기타", query: "기타" },
  ];

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  const initialCategory = categoryList.find(
    (item) => item.label === searchParams.get("category")
  ) || categoryList[0];

  const [isSelected, setIsSelected] = useState(initialCategory);
  const [search, setSearch] = useState(searchQuery);
  const [data, setData] = useState([]);

  const fetchData = async () => {
    try {
      const url = `/api/events/events-category/?search=${encodeURIComponent(
        search
      )}`;
      const response = await axios.get(url);
      setData(response.data.results || []);
    } catch (error) {
      console.error(error.response?.data || error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchQuery]); // URL search 파라미터가 바뀌면 다시 호출

  return (
    <>
      <Container>
        <C.InnerWrapper>
          <C.Header>
            <C.Back onClick={() => navigate("/home")}>
              <img
                src={`${process.env.PUBLIC_URL}/images/backbtn.svg`}
                alt="back"
              />
            </C.Back>
            <C.Category>{isSelected.label}</C.Category>
          </C.Header>

          <C.SearchBox>
            <img
              src={`${process.env.PUBLIC_URL}/images/categorysearch.svg`}
              alt="search"
              width="24px"
              style={{ marginLeft: "21px" }}
            />
            <C.Search
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  // URL 갱신 → useEffect에서 fetchData 호출됨
                  setSearchParams({ search });
                }
              }}
            />
          </C.SearchBox>

          <C.AllCategory>
            {categoryList.map((item) => (
              <C.CategoryItem
                key={item.label}
                onClick={() => {
                  setIsSelected(item);
                  setSearchParams({ search }); // 현재 검색어 유지
                }}
              >
                {item.label}
                <C.MiniLine
                  style={{
                    visibility: isSelected.query === item.query ? "visible" : "hidden",
                  }}
                />
              </C.CategoryItem>
            ))}
          </C.AllCategory>
          <C.Line />

          {data.length === 0 && <p style={{ marginLeft: 20 }}>로딩 중..</p>}
          {data.map((item) => (
            <C.ItemBox key={item.id} onClick={() => navigate(`/detailInfo/${item.id}`)}>
              <C.ItemImg src={item.main_img} />
              <C.TextBox>
                <C.TypeBox>
                  <C.Label>{item.status}</C.Label>
                  <C.Type>{item.codename}</C.Type>
                </C.TypeBox>
                <C.Title>{item.title}</C.Title>
                <C.Place>{item.place}</C.Place>
                <C.Date>{item.date}</C.Date>
              </C.TextBox>
            </C.ItemBox>
          ))}
          <C.Box />
        </C.InnerWrapper>
      </Container>
      <NavBar />
    </>
  );
};

export default Category;
