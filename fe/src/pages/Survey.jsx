import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as S from "../styles/pages/styledSurvey";
import { Container } from "../styles/common/styledContainer";
import NavBar from "../components/Navbar";
import axios from "axios";

const Survey = () => {
  return (
    <>
      <Container>
        <S.InnerWrapper>
          <S.Header>
            <S.Title>참여 인증 설문</S.Title>
          </S.Header>
          <S.TableBox>
            <S.Table>
              <S.Tbody>
                <S.Tr>
                  <S.Th scope="row" style={{borderRight:"1px solid #CFCFCF"}}>행사명</S.Th>
                  <S.Td>우리 동네 음악회</S.Td>
                </S.Tr>
                <S.Tr >
                  <S.Th scope="row" style={{borderTop:"1px solid #CFCFCF",borderRight:"1px solid #CFCFCF"}}>참여 날짜</S.Th>
                  <S.Td style={{borderTop:"1px solid #CFCFCF"}}>2025.08.16</S.Td>
                </S.Tr>
              </S.Tbody>
            </S.Table>
          </S.TableBox>
        </S.InnerWrapper>
      </Container>
    </>
  );
};
export default Survey;
