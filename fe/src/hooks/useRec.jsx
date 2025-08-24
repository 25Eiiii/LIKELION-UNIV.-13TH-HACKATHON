// src/hooks/useTopEvents.js

import { useQuery } from "@tanstack/react-query";
import useAuthStore from "../store/useAuthStore";
import { useLocation } from "../hooks/useLocation";
import { api } from "../api/fetcher";
import { fetchMonthlyTop3, normalizeTop3 } from "../api/top3";
import axios from "axios";

function fmtDateRange(a = "", b = "") {
  const toDot = (s) =>
    (s || "").replace(/[^\d]/g, "").slice(0, 8).replace(/(\d{4})(\d{2})(\d{2})/, "$1.$2.$3");
  return a && b ? `${toDot(a)} - ${toDot(b)}` : "";
}

async function fetchRecommended(topN = 3, lat, lon) {
  try {
    const { data } = await api.get("/api/recommend/events/", {
      params: { top_n: topN, lat, lon },
    });
    const list = Array.isArray(data) ? data : (data?.results ?? []);
    return list.map((ev, idx) => ({
      id: ev.id ?? idx,
      title: ev.title ?? ev.name ?? "",
      main_img: ev.main_img ?? ev.thumbnail ?? "",
      date_text: ev.period ?? fmtDateRange(ev.start_date, ev.end_date),
      hmpg_addr: ev.hmpg_addr ?? "",
    }));
  } catch (e) {
    // 로그인은 되어 있는데 추천 소스가 없어 401/403이 떨어질 수도 있으니 UI를 비우는 쪽이 안전
    if (axios.isAxiosError(e) && (e.response?.status === 401 || e.response?.status === 403)) {
      return [];
    }
    throw e;
  }
}


export function useTopEvents(topN = 3) {
  const { location, isLoading: isLocLoading } = useLocation();
  return useQuery({
    queryKey: ["recommended-events", topN, location?.latitude, location?.longitude],
    queryFn: () => fetchRecommended(topN, location?.latitude, location?.longitude),
    enabled: !isLocLoading,
    staleTime: 60_000,
  });
}

export function useTop3Monthly() {
  const token = useAuthStore((s) => s.token);
  console.log("top3 token:", token);
  const { location, isLoading: isLocationLoading } = useLocation();

  return useQuery({
    queryKey: ["top3-monthly", !!token, location?.latitude, location?.longitude],

    queryFn: () =>
      fetchMonthlyTop3({ lat: location?.latitude, lon: location?.longitude }),
    select: normalizeTop3,               //  배열로 통일
    enabled: !isLocationLoading,
    staleTime: 60_000,
  });
}