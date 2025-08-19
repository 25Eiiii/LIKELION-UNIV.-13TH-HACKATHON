import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import useMyEventStore from "../store/useMyEventStore";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";
const ENDPOINT = "/api/surveys/my-events/";

// 서버 응답: title, date, place, main_img, submitted_at
const fetchMyEvents = async () => {
  const token =
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    "";

  const res = await axios.get(`${API_BASE}${ENDPOINT}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  const raw = Array.isArray(res.data) ? res.data : res.data?.results || [];
  return raw.map((ev) => ({
    title: ev.title ?? "",
    date: ev.date ?? "",
    place: ev.place ?? "",
    main_img: ev.main_img ?? "",
    submitted_at: ev.submitted_at ?? "",
  }));
};

export function useMyEvents() {
  const setEvents = useMyEventStore((s) => s.setEvents);

  return useQuery({
    queryKey: ["my-events"],
    queryFn: fetchMyEvents,
    staleTime: 60_000,
    onSuccess: (data) => setEvents(data),
  });
}
