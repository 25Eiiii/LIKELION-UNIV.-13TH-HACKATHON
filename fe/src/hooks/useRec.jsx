// fe/src/hooks/useTopEvents.js
import { useQuery, useQueryClient } from "@tanstack/react-query";
import useAuthStore from "../store/useAuthStore";
import { useLocation } from "../hooks/useLocation";
import { api } from "../api/fetcher";

// 항상 배열로 정규화
const toArray = (d) => (Array.isArray(d) ? d : (d?.results ?? d?.data ?? []));

// 날짜 문자열 포맷 (백엔드가 date_text 없을 때 대비)
function fmtDateRange(a = "", b = "") {
  const toDot = (s) =>
    (s || "").replace(/[^\d]/g, "").slice(0, 8).replace(/(\d{4})(\d{2})(\d{2})/, "$1.$2.$3");
  return a && b ? `${toDot(a)} - ${toDot(b)}` : "";
}

// 로그인 사용자 맞춤 추천
async function fetchRecommended(topN = 3) {
  // api 인스턴스는 인터셉터로 자동 토큰 부착
  const { data } = await api.get("/api/recommend/events/", { params: { top_n: topN } });
  const list = toArray(data);
  return list.map((ev, idx) => ({
    id: ev.id ?? idx,
    title: ev.title ?? ev.name ?? "",
    main_img: ev.main_img ?? ev.thumbnail ?? "",
    date_text: ev.date_text ?? ev.period ?? fmtDateRange(ev.start_date, ev.end_date),
  }));
}

// 이달의 Top3 (로그인: private, 비로그인: public + 선택적 위치)
async function fetchTop3Monthly({ token, lat, lon, topN = 3 }) {
  if (token) {
    const { data } = await api.get("/api/top3/monthly/", { params: { top_n: topN } });
    return toArray(data);
  }
  // 비로그인일 때만 위치 파라미터 전달
  const { data } = await api.get("/api/top3/monthly/public/", {
    params: {
      top_n: topN,
      ...(lat && lon ? { lat, lon } : {}),
    },
  });
  return toArray(data);
}

export function useTopEvents(topN = 3) {
  // 토큰 변화에 반응시키기 위해 Boolean(token)을 queryKey에 포함
  const token =
    useAuthStore((s) => s.accessToken || s.token || s.access) ||
    localStorage.getItem("accessToken") ||
    "";

  return useQuery({
    queryKey: ["recommended-events", topN, Boolean(token)],
    queryFn: () => fetchRecommended(topN),
    select: (rows) => (Array.isArray(rows) ? rows : []),
    staleTime: 0,
    refetchOnMount: "always",
    retry: false,
  });
}

export function useTop3Monthly(topN = 3) {
  const token =
    useAuthStore((s) => s.accessToken || s.token || s.access) ||
    localStorage.getItem("accessToken") ||
    "";
  const { location, isLoading: isLocationLoading } = useLocation();

  return useQuery({
    // 토큰/위치가 바뀌면 자동 리패치
    queryKey: ["top3-monthly", topN, Boolean(token), location?.latitude, location?.longitude],
    queryFn: () =>
      fetchTop3Monthly({
        token,
        lat: location?.latitude,
        lon: location?.longitude,
        topN,
      }),
    select: (rows) => (Array.isArray(rows) ? rows : []),
    // 위치 권한 팝업이 끝난 뒤 실행 (권한 거부여도 isLoading=false라 실행됨)
    enabled: !isLocationLoading,
    staleTime: 0,
    refetchOnMount: "always",
    retry: false,
  });
}
