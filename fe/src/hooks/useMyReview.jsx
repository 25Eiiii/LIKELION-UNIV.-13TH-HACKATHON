import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import useMyReviewStore from "../store/useMyReviewStore";
import useAuthStore from "../store/useAuthStore";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";
const REFRESH_URL = `${API_BASE}/api/accounts/token/refresh/`;


function pickAccess() {
  const s = useAuthStore.getState?.() || {};
  return (
    s.accessToken || s.token || s.access ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("access") || ""
  );
}
function pickRefresh() {
  const s = useAuthStore.getState?.() || {};
  return s.refreshToken || localStorage.getItem("refreshToken") || "";
}
function saveAccess(newTok) {
  const st = useAuthStore.getState?.();
  st?.setAccessToken?.(newTok);
  st?.setToken?.(newTok);
  localStorage.setItem("accessToken", newTok);
}

export const useMyReview = () => {
  const setReviews = useMyReviewStore((s) => s.setReviews);

  return useQuery({
    queryKey: ["my-reviews"],
    queryFn: async () => {
      const endpoint = `${API_BASE}/api/surveys/my-reviews/`;

      const call = async (access) => {
        const { data } = await axios.get(endpoint, {
          headers: access ? { Authorization: `Bearer ${access}` } : {},
        });
        return data;
      };

      let access = pickAccess();
      try {
        const data = await call(access);
        const rows = (data || []).map((r) => ({
          id: r.id,
          title: r.title ?? "",
          main_img: r.main_img ?? null,
          content: r.content ?? "",
          created_at: r.created_at ?? "",
          photo: r.photo ?? null,
        }));
        setReviews(rows);
        return rows;
      } catch (err) {
        const status = err?.response?.status;
        const code = err?.response?.data?.code;
        // 만료/무효 시 refresh 한번 시도
        if (status === 401 && (code === "token_not_valid" || !access)) {
          const refresh = pickRefresh();
          if (!refresh) throw err;

          const { data: r } = await axios.post(REFRESH_URL, { refresh });
          if (!r?.access) throw err;

          saveAccess(r.access);
          access = r.access;

          const data2 = await call(access);
          const rows2 = (data2 || []).map((r) => ({
            id: r.id,
            title: r.title ?? "",
            main_img: r.main_img ?? null,
            content: r.content ?? "",
            created_at: r.created_at ?? "",
            photo: r.photo ?? null,
          }));
          setReviews(rows2);
          return rows2;
        }
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: (n, e) => (e?.response?.status === 401 ? false : n < 1),
    onError: (e) => console.warn("my-reviews error:", e?.response?.status, e?.response?.data || e?.message),
  });
};
