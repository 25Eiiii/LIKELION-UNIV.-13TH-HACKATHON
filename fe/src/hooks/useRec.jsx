// src/hooks/useTopEvents.js
import { useQuery } from "@tanstack/react-query";
import useAuthStore from "../store/useAuthStore";
import { useLocation } from "../hooks/useLocation";
import { api } from "../api/fetcher"; 

/**
 * 날짜 범위를 'YYYY.MM.DD - YYYY.MM.DD' 형식으로 변환합니다.
 * @param {string} a - 시작일
 * @param {string} b - 종료일
 * @returns {string} 포맷팅된 날짜 문자열
 */
function fmtDateRange(a = "", b = "") {
  const toDot = (s) =>
    (s || "").replace(/[^\d]/g, "").slice(0, 8).replace(/(\d{4})(\d{2})(\d{2})/, "$1.$2.$3");
  return a && b ? `${toDot(a)} - ${toDot(b)}` : "";
}

/**
 * 추천 이벤트를 가져오는 API 함수 (GET 요청)
 * @param {number} topN - 가져올 이벤트 개수
 */
async function fetchRecommended(topN = 3) {
  const response = await api.get("/api/recommend/events/", {
    params: { top_n: topN },
  });

  const raw = response.data;
  const list = Array.isArray(raw) ? raw : raw?.results || [];

  return list.map((ev, idx) => ({
    id: ev.id ?? idx,
    title: ev.title ?? ev.name ?? "",
    main_img: ev.main_img ?? ev.thumbnail ?? "",
    date_text: ev.period ?? fmtDateRange(ev.start_date, ev.end_date),
  }));
}

/**
 * 월간 Top 3 이벤트를 가져오는 API 함수 (GET 요청)
 * @param {object} params - { token, lat, lon }
 */
async function fetchTop3Monthly({ token, lat, lon }) {
  const urlPath = token ? "/api/top3/monthly/" : "/api/top3/monthly/public/";
  
  const params = {};
  if (!token && lat && lon) {
    params.lat = lat;
    params.lon = lon;
  }

  const response = await api.get(urlPath, { params });
  const json = response.data;

  return Array.isArray(json) ? json : json?.results || [];
}

/**
 * 추천 이벤트를 가져오는 React Query 훅
 * @param {number} topN 
 */
export function useTopEvents(topN = 3) {
  return useQuery({
    queryKey: ["recommended-events", topN],
    queryFn: () => fetchRecommended(topN),
  });
}

/**
 * 월간 Top 3 이벤트를 가져오는 React Query 훅
 */
export function useTop3Monthly() {
  const token = useAuthStore((s) => s.token);
  const { location, isLoading: isLocationLoading } = useLocation();

  return useQuery({
    queryKey: ["top3-monthly", !!token, location?.latitude, location?.longitude],
    queryFn: () =>
      fetchTop3Monthly({
        token,
        lat: location?.latitude,
        lon: location?.longitude,
      }),
    enabled: !isLocationLoading,
  });
}