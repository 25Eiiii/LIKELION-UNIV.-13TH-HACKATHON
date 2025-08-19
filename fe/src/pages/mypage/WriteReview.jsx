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
        <W.Back onClick={() => navigate("/home")}>
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
        maxLength={MAX_LEN}
      />
      <W.Counter $error={contentError}>
        {content.length} / {MAX_LEN}
      </W.Counter>
      {contentError && <W.Warn>※ 본문을 입력해 주세요.</W.Warn>}

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
        {rating > 0 && <W.StarText>{rating} / 5</W.StarText>}
      </W.Stars>

      <W.Label style={{ fontSize: "15px", fontWeight: "500", marginTop: "30px"}}>인증샷 추가 (선택)</W.Label>
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
      <W.Hint>사진을 올리면 추가 포인트가 지급될 수 있어요.</W.Hint>

      <W.Label style={{ fontSize: "15px", fontWeight: "500"}}>추가 설문 (선택)</W.Label>
      <W.Input
        value={extra}
        onChange={(e) => setExtra(e.target.value)}
        placeholder="다음에도 성북에서 해주세요! 등"
      />

      <W.Submit disabled={submitting || content.trim().length === 0} onClick={handleSubmit}>
        등록하기
      </W.Submit>
    </Container>
  );
};

export default WriteReview;

