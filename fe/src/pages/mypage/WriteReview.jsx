import React, { useMemo, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Container } from "../../styles/common/styledContainer";
import * as W from "../../styles/pages/styledWriteReview"
import useAuthStore from "../../store/useAuthStore";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";
const MAX_LEN = 600;

const WriteReview = () => {
  const [sp] = useSearchParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const token = useAuthStore((s) => s.token);

  const [content, setContent] = useState("");
  const [extra, setExtra] = useState("");
  const [rating, setRating] = useState(0);
  const [photoFile, setPhotoFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState(false);

  const contentError = useMemo(
    () => touched && content.trim().length === 0,
    [touched, content]
  );

  const onSelectPhoto = (e) => {
    const f = e.target.files?.[0];
    if (f) setPhotoFile(f);
  };

  const handleSubmit = async () => {
    setTouched(true);
    if (content.trim().length === 0) return;

    const fd = new FormData();
    
    fd.append("content", content.trim());
    if (extra.trim()) fd.append("extra_feedback", extra.trim());
    if (rating > 0) fd.append("rating", String(rating));
    if (photoFile) fd.append("photo", photoFile);

    try {
      setSubmitting(true);
      await axios.post(`${API_BASE}/api/surveys/review/`, fd, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        // FormData 사용 시 Content-Type은 axios가 자동 설정 (boundary 포함)
      });
      // 후기 목록 새로고침
      await qc.invalidateQueries({ queryKey: ["my-reviews"] });
      alert("후기가 등록되었습니다.");
      navigate(-1); // 이전 화면으로
    } catch (e) {
      console.error(e);
      alert("등록에 실패했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container>
      <W.Header>
        <W.Back onClick={() => navigate("/mypage-myevent")}>
          <img
            src={`${process.env.PUBLIC_URL}/images/backbtn.svg`}
            alt="back"
          />
        </W.Back>
        <p>후기작성</p>
      </W.Header>

      <W.Card>
        <W.Thumb />
        <W.EventTitle>우리동네 음악회</W.EventTitle>
      </W.Card>

      <W.Label>
        효민님, <br></br>
        이번에 참여한 문화 행사는 어땠나요?<br /> <W.Req>본문 입력 (필수)</W.Req>
      </W.Label>
      <W.TextArea
        value={content}
        onChange={(e) => setContent(e.target.value.slice(0, MAX_LEN))}
        onBlur={() => setTouched(true)}
        placeholder="내용을 입력해주세요."
        $error={contentError}
        maxLength={MAX_LEN}>
          <W.Counter $error={contentError}>
          {content.length} / {MAX_LEN}
        </W.Counter>
      </W.TextArea>
      {contentError && <W.Warn>필수 입력 사항입니다.</W.Warn>}
      

      <W.Label style={{ fontSize: "15px", fontWeight: "500"}}>별점 선택 (필수)</W.Label>
      <W.Stars>
        {Array.from({ length: 5 }).map((_, i) => {
          const v = i + 1;
          return (
            <W.Star
              key={v}
              aria-label={`${v}점`}
              onClick={() => setRating(v)}
              $active={v <= rating}
            >
              ★
            </W.Star>
          );
        })}
      </W.Stars>

      <W.UploadRow>
        <W.UploadBox>
          <input
            id="photo"
            type="file"
            accept="iContainer/*"
            onChange={onSelectPhoto}
            style={{ display: "none" }}
          />
          <label htmlFor="photo">＋</label>
        </W.UploadBox>
        {photoFile && <W.Preview src={URL.createObjectURL(photoFile)} alt="preview" />}
      </W.UploadRow>
      <W.Hint>인증샷 추가시 <p style={{ color: "#60C795", fontWeight: "600"}}>+50 P</p></W.Hint>

      <W.Label style={{ fontSize: "15px", fontWeight: "500"}}>추가 설문 (선택)</W.Label>
      <W.Input
        value={extra}
        onChange={(e) => setExtra(e.target.value)}
        placeholder="내용을 입력해주세요."
      />

      <W.Submit disabled={submitting || content.trim().length === 0} onClick={handleSubmit}>
        등록하기
      </W.Submit>
    </Container>
  );
};

export default WriteReview;

