import styled from "styled-components";

export const Header = styled.div`
width: 428px;
height: 41px;
background: #282F56;
padding-top: 43px
`;

export const InnerWrapper = styled.div`
width: 428px;
min-height: 926px;

`;

export const Back = styled.div`
width: 15px;
height: 9px;
margin-left: 38px;

`;

export const HeaderTitle = styled.div`
width: 150px;
height: 22px;
flex-shrink: 0;
color: #FFF;
font-family: Pretendard;
font-size: 20px;
font-style: normal;
font-weight: 600;
line-height: normal;
margin-left: 140px;
margin-top: -15px;
text-align: center;
`;

export const SearchBox = styled.div`
display: flex;
align-items: center;
gap: 13px;
color: #9A9A9A;
font-family: Pretendard;
font-size: 15px;
font-style: normal;
font-weight: 500;
line-height: normal;
padding-top: 5px;
`;

export const Search = styled.input`
width: 150px;
height: 40px;
outline: none;
border: none;
color: #2C2C2C;
font-family: Pretendard;
font-size: 15px;
font-style: normal;
font-weight: 500;
line-height: normal;

::placeholder{
color: #9A9A9A;
font-family: Pretendard;
font-size: 15px;
font-style: normal;
font-weight: 500;
line-height: normal;
};
`;

export const AllCategory = styled.div`
display: flex;
align-items: center;
gap: 19px;
width:auto;
height: auto;
margin-top: 10px;
overflow-x: scroll;
flex-wrap: nowrap;
position: relative;
&::-webkit-scrollbar{
display: none;
}

`;

export const CategoryItem = styled.div`
width: auto;
height: auto;
font-family: Pretendard;
font-size: 17px;
font-style: normal;
font-weight: 400;
line-height: normal;
margin-left:15px;
flex-shrink: 0;
display: flex;
flex-direction: column;
justify-content: center;
text-align: center;
cursor: default;
`; 

export const Line = styled.div`
width: 438px;
height: 1px;
flex-shrink: 0;
background: #D9D9D9;
display: absolute;
margin-bottom: 40px;
`;

export const MiniLine = styled.div`
display: inline-block;
height: 1px;
flex-shrink: 0;
background: #2F3F78;
margin-top: 8px;
`;


export const ItemBox = styled.div`
display: flex;
height: 170px;
align-items: center;
margin-bottom: 10px;
`;

export const ItemImg = styled.img`
width: 107px;
height: 154px;
flex-shrink: 0;
border-radius: 6px;
margin-right: 25px;
margin-left: 21px;
`;

export const TextBox = styled.div`

`;

export const TypeBox = styled.div`
display: flex;
gap: 6px;
margin-bottom:7px;
`;

export const Label = styled.div`
width: 79px;
height: 25px;
flex-shrink: 0;
border-radius: 12.5px;
border: 1px solid #8E8E8E;
color: #767676;
font-family: Pretendard;
font-size: 15px;
font-style: normal;
font-weight: 500;
line-height: normal;
display: flex;
align-items: center;
justify-content: center;
`;

export const Type = styled.div`
min-width: 51px;
padding-left: 2px;
padding-right: 2px;
height: 25px;
flex-shrink: 0;
border-radius: 12.5px;
background: #FFB163;
color: #FFF;
font-family: Pretendard;
font-size: 15px;
font-style: normal;
font-weight: 500;
line-height: normal;
display: flex;
align-items: center;
justify-content: center;
`;

export const Title = styled.div`
width: 240px;
height: auto;
color: #3C3C3C;
font-family: Pretendard;
font-size: 20px;
font-style: normal;
font-weight: 600;
line-height: normal;
margin-bottom: 6px;
display: -webkit-box;
-webkit-line-clamp: 2;  
-webkit-box-orient: vertical;
overflow: hidden;
text-overflow: ellipsis;
`;

export const Place = styled.div`
width: 240px;
height: 28px;
color: #000;
font-family: Pretendard;
font-size: 17px;
font-style: normal;
font-weight: 400;
line-height: normal;
white-space: nowrap;
overflow: hidden;
text-overflow: ellipsis;
`;

export const Date = styled.div`
width: auto;
height: 28px;
color: #000;
font-family: Pretendard;
font-size: 15px;
font-style: normal;
font-weight: 300;
line-height: normal;
`;

export const Box = styled.div`
height: 80px;
`;