import { styled } from "styled-components"

/* 헤더: 가운데 제목 + 좌측 백버튼 (sticky 옵션) */
export const Header = styled.header`
  position: sticky;      /* 스크롤해도 상단 고정 원하면 sticky, 아니면 relative */
  top: 0;
  z-index: 10;
  background: #282f56;
width: 428px;
height: 41px;
  display: flex;
  align-items: center;
  min-height: 56px;      /* 고정 height 대신 min-height로 유연하게 */
  padding: 12px 16px 8px;
  /* 가운데 제목 */
  p {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    color: #fff;
    font-size: 18px;
    font-weight: 600;
    margin: 0;
  }
`;

export const Back = styled.button`
width: 15px;
height: 9px;
margin-left: 38px;
border: none;
background: none;
position: absolute;
left: 0;
display: flex;
align-items: center;
`;

/* 본문: 스크롤 영역 */
export const Content = styled.main`
  flex: 1 1 auto;
  overflow-y: auto;      /* ✅ 여기서 스크롤 발생 */
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;

  /* 내부 컨텐츠 가로 여백 */
  padding: 16px 16px 24px;
  background: #f7f7fa;   /* 필요시 화면 대비용 */
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
`;

export const Spacer = styled.div`
width: 32px;`;

export const Card = styled.div`
display: flex;
flex-direction: column;
gap: 12px;
align-items: center;
background: #fff;
border-radius: 12px;
margin-top: 38px;
`;
export const Thumb = styled.img`
width: 230px;
height: 299px;
flex-shrink: 0;
border-radius: 11px;
box-shadow: 0 1px 7px 0 rgba(0, 0, 0, 0.25);
`;
export const EventTitle = styled.div`
color: #676767;
font-family: Pretendard;
font-size: 16px;
font-style: normal;
font-weight: 600;
line-height: normal;
`;

export const Label = styled.div`
color: #3F3F3F;
font-family: Pretendard;
font-size: 19px;
font-style: normal;
font-weight: 600;
line-height: normal;
width: 370px;
`;
export const Req = styled.span`
font-weight: 500;
font-size: 15px;
`;

export const TextArea = styled.textarea`
background: #fff;
border-radius: 12px;
border: 1.5px solid ${({ $error }) => ($error ? "#e11" : "#ddd")};
min-height: 120px;
padding: 12px;
resize: vertical;
outline: none;
width: 350px;
padding: none;
margin-top: 10px;
color: #B0B0B0;
font-family: Pretendard;
font-size: 15px;
font-style: normal;
font-weight: 500;
line-height: normal;

`;
export const Counter = styled.div`
font-size: 12px;
color: ${({ $error }) => ($error ? "#e11" : "#888")};
`;

export const Warn = styled.div`
color: #e11;
font-size: 12px;
display: flex;
justify-content: flex-start;
width: 370px;
`;

export const Stars = styled.div`
display: flex;
align-items: center;
gap: 8px;
width: 370px;
margin-left: -10px;
`;
export const Star = styled.button`
border: 0;
background: transparent;
font-size: 24px;
cursor: pointer;
color: ${({ $active }) => ($active ? "#ffb400" : "#ccc")};
`;

export const UploadRow = styled.div`
display: flex;
align-items: center;
gap: 16px;
width: 370px;
`;
export const UploadBox = styled.div`
width: 62px;
height: 62px;
flex-shrink: 0;
border: 1px dashed #cfd6e4;
border-radius: 8px;
display: grid;
place-items: center;
color: #6b7280;
font-size: 24px;
cursor: pointer;
label { cursor: pointer; }
`;
export const Preview = styled.img`
width: 62px;
height: 62px;
flex-shrink: 0;
border-radius: 8px;
`;

export const Hint = styled.p`
color: #525252;
font-family: Pretendard;
font-size: 12px;
font-style: normal;
font-weight: 500;
width: 370px;
display: flex;
align-items: center;
gap: 5px;
margin: 0;
`;

export const Input = styled.textarea`
background: #fff;
border-radius: 12px;
border: 1.5px solid ${({ $error }) => ($error ? "#e11" : "#ddd")};
min-height: 120px;
padding: 12px;
resize: vertical;
outline: none;
width: 350px;
padding: none;
margin-top: 10px;
color: #B0B0B0;
font-family: Pretendard;
font-size: 15px;
font-style: normal;
font-weight: 500;
line-height: normal;
`;

export const Submit = styled.button`
margin-top: 8px;
width: 117px;
height: 38px;
flex-shrink: 0;
border-radius: 42px;
background: #60C795;
box-shadow: 0 0 17px 0 rgba(11, 45, 69, 0.25);
color: #fff;
font-weight: 700;
cursor: pointer;
opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
border: none;
margin-bottom: 18px;
margin-top: 24px;
`;
