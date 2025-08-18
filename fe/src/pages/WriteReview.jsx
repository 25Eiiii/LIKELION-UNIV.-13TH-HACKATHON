import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useState } from "react";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "http://localhost:8000",
});

export default function WriteReview() {
  const { eventId } = useParams();              // /events/:eventId/review/new 에서 가져옴
  const { state } = useLocation();              // Link에서 전달한 title 등
  const nav = useNavigate();

  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  if (!eventId) return <p>잘못된 접근이에요. (eventId 없음)</p>;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setPending(true);

    const fd = new FormData(e.currentTarget); // rating, content, extra_feedback, photo

    try {
      const res = await api.post(`/api/events/${eventId}/reviews/`, fd, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      // 응답에서 행사 id 꺼내서 상세 페이지로 이동
      nav(`/events/${res.data.event}`);
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "저장 실패";
      setError(msg);
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <h2>{state?.title ? `${state.title} 후기 작성` : `행사 ${eventId} 후기 작성`}</h2>

      <label>
        평점
        <input type="number" name="rating" min="1" max="5" required />
      </label>

      <label>
        내용
        <textarea name="content" required />
      </label>

      <label>
        추가 피드백(선택)
        <textarea name="extra_feedback" />
      </label>

      <label>
        사진(선택)
        <input type="file" name="photo" accept="image/*" />
      </label>

      <button type="submit" disabled={pending}>
        {pending ? "저장 중…" : "저장"}
      </button>

      {error && <p style={{ color: "crimson" }}>{error}</p>}
    </form>
  );
}
