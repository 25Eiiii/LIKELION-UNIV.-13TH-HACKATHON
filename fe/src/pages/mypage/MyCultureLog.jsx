import React from 'react';
import styled from 'styled-components';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px 26px;
`;

const CardGroup = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
`;

export const ReviewBtn = styled.button`
  width: 95px;
  height: 27px;
  flex-shrink: 0;
  border-radius: 8px;
  border: 1px solid #BCBCBC;
  width: 100%;
  display: flex;
  align-self: flex-end;
  position: absolute;
  top: 95px;
  box-sizing: border-box;
`;

export const CultureItem = styled.div`
  display: flex;
  gap: 30px;
`;

export const CultureThumbnail = styled.img`
  width: 93px;
  height: 127px;
  flex-shrink: 0;
`;

export const CultureInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const CultureTitle = styled.div`
  color: #353535;
  font-family: Pretendard;
  font-size: 17px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
`;

export const CultureDate = styled.div`
  color: #404040;
  font-family: Pretendard;
  font-size: 13px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
`;

export const CultureLocation = styled.div`
  color: #848484;
  font-family: Pretendard;
  font-size: 13px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
`;

const MyCultureLog = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['myEvents'],
    queryFn: async () => {
      // 로컬 스토리지 또는 다른 곳에서 토큰을 가져옵니다.
      const token = localStorage.getItem('authToken'); // 'authToken'은 예시 키입니다. 실제 키를 사용하세요.
  
      // 토큰이 없으면 오류를 반환하거나 로그인 페이지로 리디렉션할 수 있습니다.
      if (!token) {
        throw new Error('No authentication token found.');
      }
  
      const response = await axios.get('/api/surveys/my-events/', {
        headers: {
          Authorization: `Bearer ${token}`, // 'Bearer'는 일반적인 토큰 타입입니다.
        },
      });
      return response.data;
    },
  });

  if (isLoading) return <Wrapper>불러오는 중...</Wrapper>;
  if (isError) return <Wrapper>오류 발생</Wrapper>;
  if (!data || data.length === 0) return <Wrapper>참여한 행사가 없습니다.</Wrapper>;

  return (
    <Wrapper>
      {data.map((event) => (
        <CardGroup key={event.id}>
          <CultureItem>
            <CultureThumbnail
              src={event.main_img}
              alt={event.title}
            />
            <CultureInfo>
              <CultureTitle>{event.title}</CultureTitle>
              <CultureDate>{event.date}</CultureDate>
              <CultureLocation>{event.place}</CultureLocation>
            </CultureInfo>
          </CultureItem>
          <ReviewBtn>후기 작성하기</ReviewBtn>
        </CardGroup>
      ))}
    </Wrapper>
  );
};

export default MyCultureLog;