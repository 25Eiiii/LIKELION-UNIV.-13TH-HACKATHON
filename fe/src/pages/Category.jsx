import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams} from "react-router-dom";
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
  
  const [searchParams,setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category");
  const initialSelected = categoryList.find(item=>item.label===initialCategory) || categoryList[0];
  const [isSelected, setIsSelected] = useState(initialSelected);
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
      const categoryQuery = isSelected.query;
      const url = categoryQuery ? `/api/events/events-category/?category=${categoryQuery}&search=${search}` : `/api/events/events-category/?search=${search}`
      const response = await axios.get(url);
      setData(response.data);
    } catch (error) {
      console.log(error.response.data);
    }
  };
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
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  SearchCategory();
                }
              }}
              onChange={(e) => setSearch(e.target.value)}
            />
          </C.SearchBox>
          <C.AllCategory>
            {categoryList.map((item) => (
              <C.CategoryItem
                onClick={() => {
                  setIsSelected(item);
                  setSearchParams({category: item.label});
                }}
              >
                {item.label}
                <C.MiniLine
                  style={{
                    visibility: isSelected.query === item.query ? "visible" : "hidden",
                  }}
                ></C.MiniLine>
              </C.CategoryItem>
            ))}
          </C.AllCategory>
          <C.Line></C.Line>

          {data?.results?.map((item) => (
            <C.ItemBox>
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
          <C.Box></C.Box>
        </C.InnerWrapper>
      </Container>
      <NavBar></NavBar>
    </>
  );
};
export default Category;
