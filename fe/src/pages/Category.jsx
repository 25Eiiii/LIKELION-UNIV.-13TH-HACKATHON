import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as C from "../styles/pages/styledCategory";
import { Container } from "../styles/common/styledContainer";
import NavBar from "../components/Navbar";
import axios from "axios";

const Category = () => {
  const categoryList = [
    "전체",
    "무대/공연",
    "전시/미술",
    "교육/체험",
    "축제",
    "음악/콘서트",
    "기타",
  ];
  const [isSelected, setIsSelected] = useState();
  const [search, setSearch] = useState("");
  const [data, setData] = useState();

  const SearchCategory = async () => {
    try {
      const response = await axios.get(
        `/api/events/events-category/?category=${isSelected}&search=${search}`
      );
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
            <C.Back>
              <img
                src={`${process.env.PUBLIC_URL}/images/backbtn.svg`}
                alt="back"
              />
            </C.Back>
            <C.Category>{isSelected}</C.Category>
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
            />
          </C.SearchBox>
          <C.AllCategory>
            {categoryList.map((item) => (
              <C.CategoryItem 
                    onClick={() => {
                        setIsSelected(item);
                        SearchCategory();
                    }}>
                {item}
                <C.MiniLine
                  style={{
                    visibility: isSelected === item ? "visible" : "hidden",
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
        </C.InnerWrapper>
      </Container>
      <NavBar></NavBar>
    </>
  );
};
export default Category;
