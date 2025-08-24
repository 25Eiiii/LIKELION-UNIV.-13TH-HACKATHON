import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import * as S from "../styles/pages/styledSearch";
import { Container } from "../styles/common/styledContainer";
import NavBar from "../components/Navbar";
import axios from "axios";

const Search = () => {
  const categoryList = [
    { label: "전체", query: "" },
    { label: "무대/공연", query: "무대/공연" },
    { label: "전시/미술", query: "전시/미술" },
    { label: "교육/체험", query: "교육/체험" },
    { label: "축제", query: "축제" },
    { label: "음악/콘서트", query: "음악/콘서트" },
    { label: "기타", query: "기타" },
  ];

  const [isSelected, setIsSelected] = useState(categoryList[0]);
  const [search, setSearch] = useState("");
  const [data, setData] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    if (isSelected) {
      SearchCategory();
    }
  }, [isSelected]);

  const SearchCategory = async () => {
    try {
      const response = await axios.get(
        `/api/events/events-category/?category=${isSelected.query}&search=${search}`
      );
      setData(response.data);
    } catch (error) {
      console.log(error.response.data);
    }
  };
  return (
    <>
      <Container>
        <S.InnerWrapper>
          <S.Top>
          <S.Header>
            <S.Back onClick={() => navigate(-1)}>
              <img
                src={`${process.env.PUBLIC_URL}/images/backbtn.svg`}
                alt="back"
              />
            </S.Back>
            <S.HeaderTitle>탐색</S.HeaderTitle>
          </S.Header>
          <S.SearchBox>
            <img
              src={`${process.env.PUBLIC_URL}/images/categorysearch.svg`}
              alt="search"
              width="24px"
              style={{ marginLeft: "21px" }}
            />
            <S.Search
              placeholder="Search"
              value={search}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  SearchCategory();
                }
              }}
              onChange={(e) => setSearch(e.target.value)}
            />
          </S.SearchBox>
          <S.AllCategory>
            {categoryList.map((item) => (
              <S.CategoryItem
                onClick={() => {
                  setIsSelected(item);
                }}
              >
                {item.label}
                <S.MiniLine
                  style={{
                    visibility:
                      isSelected.query === item.query ? "visible" : "hidden",
                  }}
                ></S.MiniLine>
              </S.CategoryItem>
            ))}
          </S.AllCategory>
          <S.Line></S.Line>
          </S.Top>
          <S.ScrollArea>
          {data?.results?.map((item) => (
            <S.ItemBox onClick={() => navigate(`/detailInfo/${item.id}`)}>
              <S.ItemImg src={item.main_img} />
              <S.TextBox>
                <S.TypeBox>
                  <S.Label>{item.status}</S.Label>
                  <S.Type>{item.codename}</S.Type>
                </S.TypeBox>
                <S.Title>{item.title}</S.Title>
                <S.Place>{item.place}</S.Place>
                <S.Date>{item.date}</S.Date>
              </S.TextBox>
            </S.ItemBox>
          ))}
          <S.Box></S.Box>
          </S.ScrollArea>
        </S.InnerWrapper>
      </Container>
      <NavBar></NavBar>
    </>
  );
};
export default Search;
