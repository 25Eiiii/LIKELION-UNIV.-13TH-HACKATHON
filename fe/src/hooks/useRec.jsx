// src/hooks/useTopEvents.js
import { useQuery } from "@tanstack/react-query";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";
const authHeaders = () => {
  const t = localStorage.getItem("accessToken");
  return t ? { Authorization: `Bearer ${t}` } : {};
};

function fmtDateRange(a = "", b = "") {
  const toDot = (s) =>
    (s || "").replace(/[^\d]/g, "").slice(0, 8).replace(/(\d{4})(\d{2})(\d{2})/, "$1.$2.$3");
  return a && b ? `${toDot(a)} - ${toDot(b)}` : "";
}

async function fetchRecommended(topN = 3) {
  const token = localStorage.getItem("accessToken") || "";
  const url = new URL("/api/recommend/events/", API_BASE);
  url.searchParams.set("top_n", String(topN));

  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const raw = await res.json();

  const list = Array.isArray(raw) ? raw : raw?.results || [];
  return list.map((ev, idx) => ({
    id: ev.id ?? idx,
    title: ev.title ?? ev.name ?? "",
    main_img: ev.main_img ?? ev.thumbnail ?? "",
    date_text: ev.period ?? fmtDateRange(ev.start_date, ev.end_date),
  }));
}

export function useTopEvents(topN = 3) {
  return useQuery({
    queryKey: ["recommended-events", topN],
    queryFn: () => fetchRecommended(topN),
  });
}

// 월간 Top3
export function useTop3Monthly() {
  async function fetchTop3() {
    const url = new URL("/api/top3/monthly/", API_BASE);
    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    console.log("🔍 Top3 raw response:", json);   // ✅ 응답 원본 확인
    return Array.isArray(json) ? json : json?.results || [];
  }
  return useQuery({ queryKey: ["top3-monthly"], queryFn: fetchTop3 });
}
