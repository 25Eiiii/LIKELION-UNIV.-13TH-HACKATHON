import { styled } from "styled-components"

export const Header = styled.div`
width: 428px;
height: 41px;
background: #282F56;
padding-top: 43px;
display: flex;
align-items: center;
position: relative;
p{
flex-shrink: 0;
color: #FFF;
font-family: Pretendard;
font-size: 20px;
font-style: normal;
font-weight: 600;
line-height: normal;
text-align: center;
display: flex;
align-self: center;
justify-self: center;
position: absolute;
left: 50%;
transform: translateX(-50%);
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

export const Spacer = styled.div`width: 32px;`;

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
  border: 1px solid ${({ $error }) => ($error ? "#e11" : "#ddd")};
  min-height: 120px;
  padding: 12px;
  resize: vertical;
  outline: none;
  width: 370px;
  padding: none;
  margin-top: 10px;
  margin-bottom: 30px;
`;
export const Counter = styled.div`
  font-size: 12px;
  color: ${({ $error }) => ($error ? "#e11" : "#888")};
  align-self: flex-end;
  margin-top: -20px;
  margin-right: 30px
`;
export const Warn = styled.div`
  color: #e11;
  font-size: 12px;
  margin-top: -6px;
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
export const StarText = styled.span`
  font-size: 13px;
  color: #666;
`;

export const UploadRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;
export const UploadBox = styled.div`
  width: 48px;
  height: 48px;
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
  width: 72px;
  height: 72px;
  object-fit: cover;
  border-radius: 8px;
`;

export const Hint = styled.div`
  color: #8a8a8a;
  font-size: 12px;
`;

export const Input = styled.input`
  background: #fff;
  border-radius: 10px;
  border: 1px solid #ddd;
  height: 40px;
  padding: 0 12px;
  outline: none;
  width: 428px;
`;

export const Submit = styled.button`
  margin-top: 8px;
  height: 44px;
  border-radius: 12px;
  border: 0;
  background: #2f3f78;
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
`;
