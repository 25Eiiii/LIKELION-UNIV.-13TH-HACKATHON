import styled from "styled-components";

export const Header = styled.div`
width: 428px;
height: 41px;
background: #282F56;
padding-top: 43px;
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

export const Title = styled.div`
width: 150px;
height: 22px;
color: #FFF;
text-align: center;
font-family: Pretendard;
font-size: 20px;
font-style: normal;
font-weight: 600;
line-height: normal;
text-align: center;
margin-left: 140px;
margin-top: -15px;
`;

export const TableBox = styled.div`
width: 377px;
height: 77px;
flex-shrink: 0;
border-radius: 10px;
border: 1px solid #CFCFCF;
background: #ECEEF2;
overflow: hidden;
margin-left: 24px;
margin-top:34px;
margin-bottom: 31px;
`;

export const Table = styled.table`
width: 100%;
border-spacing: 0;
`;

export const Tbody = styled.tbody`

`;

export const Tr = styled.tr`

`;

export const Th = styled.th`
width: 100px; 
padding-top:8px;
padding-bottom: 7px;
color: #7E7E7E;
font-family: Pretendard;
font-size: 16px;
font-style: normal;
font-weight: 400;
line-height: normal;


`;

export const Td = styled.td`
color: #434343;
font-family: Pretendard;
font-size: 16px;
font-style: normal;
font-weight: 500;
line-height: normal;
padding-left: 10px;
padding-top: 5px;
input{
background: #ECEEF2;
border: none;
outline: none;
color: #434343;
font-family: Pretendard;
font-size: 16px;
font-style: normal;
font-weight: 500;
line-height: normal;

&::placeholder{
color: #6868688c;
}

}

display: -webkit-box;
-webkit-line-clamp: 1;  
-webkit-box-orient: vertical;
overflow: hidden;
text-overflow: ellipsis;

`;

export const Question = styled.div`
margin-left:25px;
color: #454545;
font-family: Pretendard;
font-size: 16px;
font-style: normal;
font-weight: 600;
line-height: normal;
margin-bottom: 19px;
`;

export const Qbox = styled.div`
margin-left: 20px;
margin-bottom: 5px;

label{
color: #626262;
font-family: Pretendard;
font-size: 15px;
font-style: normal;
font-weight: 400;
line-height: normal;
margin-left: 9px;
}
`;

export const Option = styled.input`

`;

export const Etc = styled.input`
width: 369px;
height: 30px;
flex-shrink: 0;
border-radius: 3px;
border: 1px solid #C4C4C4;
margin-left: 30px;
outline: none;
`;

export const Submit = styled.div`
width: 117px;
height: 38px;
flex-shrink: 0;
background: #61688C;
border-radius: 42px;
box-shadow: 0 0 17px 0 rgba(11, 45, 69, 0.25);
color: #FFF;
font-family: Pretendard;
font-size: 15px;
font-style: normal;
font-weight: 600;
line-height: normal;
display: flex;
align-items: center;
justify-content: center;
margin-left: 155px;
margin-top: 15px;
cursor: pointer;
&:active { background: #282F56; }
`;

