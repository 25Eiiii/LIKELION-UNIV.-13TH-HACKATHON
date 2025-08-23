import { useQuery } from "@tanstack/react-query";
import useAuthStore from "../store/useAuthStore";
import { api } from "../api/fetcher"

const pickToken = () =>
  useAuthStore.getState?.()?.token ||
  localStorage.getItem("accessToken") ||
  localStorage.getItem("token") ||
  "";

function normalizeList(raw) {
  const list = Array.isArray(raw) ? raw : raw?.results || [];
  return list.map((ev) => {
    const eventId = ev.event ?? ev.event_id ?? null;
    const start = ev.start_date ?? "";
    const end = ev.end_date ?? "";
    return {
      event_id: eventId,           
      title: ev.title ?? "",
      main_img: ev.main_img ?? null,
      place: ev.place ?? "",
      start_date: start,
      end_date: end,
      date: ev.date_text ?? (start && end ? `${start} - ${end}` : start || ""),
    };
  });
}

export const useMyEvents = () =>
  useQuery({
    queryKey: ["myEvents", "/api/surveys/my-events/"],
    queryFn: async () => {
      const token = pickToken();
      const { data } = await api.get("/api/surveys/my-events/", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return normalizeList(data);
    },
    staleTime: 5 * 60 * 1000,
    retry: 0,
  });