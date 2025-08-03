import { styled } from "styled-components"

export const NavWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
    align-items: center;
    bottom: 50px;
    width: 428px;
    justify-self: center;
    position: fixed;
    justify-content: space-around;
    background: #FFFFFF;
    border-bottom-left-radius: 30px;
    border-bottom-right-radius: 30px;
    z-index: 999;
    box-shadow: 0 -1px 10px 0 rgba(0, 0, 0, 0.11);
`

export const Line = styled.div`
    width: 418px;
    height: 1px;
`

export const Group = styled.div`
    display: flex;
    flex-direction: row;
    gap: 40px;
    align-items: flex-end;
`

export const Icon = styled.button`
    height: 52px;
    flex-shirink: 0;
    border-radius: 7px;
    border: none;
    background: none;
    display: flex;
    align-items: center;
    justify-content: center;
    display: flex;
    flex-direction: column;
    color: #282F56;
font-family: Pretendard;
font-size: 10px;
font-style: normal;
font-weight: 500;
line-height: normal;
`