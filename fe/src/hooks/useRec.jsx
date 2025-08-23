// src/hooks/useTopEvents.js
import { useQuery } from "@tanstack/react-query";
import useAuthStore from "../store/useAuthStore";
import { useLocation } from "../hooks/useLocation";
import { api } from "../api/fetcher"

const API_BASE = process.env.REACT_APP_API_BASE_URL || "";
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
  const token = useAuthStore.getState().token;
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

async function fetchTop3Monthly({ token, lat, lon }) {
  const urlPath = token ? "/api/top3/monthly/" : "/api/top3/monthly/public/";
  const url = new URL(urlPath, API_BASE);
  
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const params = !token && lat && lon ? { lat, lon } : {}; // 2. 비로그인 시 lat, lon 파라미터 추가

  const res = await fetch(url, { headers, params: new URLSearchParams(params) });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  
  return Array.isArray(json) ? json : json?.results || [];
}

export function useTopEvents(topN = 3) {
  return useQuery({
    queryKey: ["recommended-events", topN],
    queryFn: () => fetchRecommended(topN),
  });
}

export function useTop3Monthly() {
  const token = useAuthStore((s) => s.token);
  console.log("top3 token:", token)
  const { location, error: locationError, isLoading: isLocationLoading } = useLocation(); // 3. 위치 정보 가져오기

  return useQuery({
    queryKey: ["top3-monthly", !!token, location?.latitude, location?.longitude],
    
    queryFn: () => fetchTop3Monthly({
      token,
      lat: location?.latitude,
      lon: location?.longitude,
    }),
    

    enabled: !isLocationLoading, 
  });
}
