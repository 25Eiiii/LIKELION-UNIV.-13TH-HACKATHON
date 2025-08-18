// src/hooks/useTopEvents.jsx
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useTopEvents = (month, count = 3) => {
  return useQuery({
    queryKey: ["top-events", month, count],
    queryFn: async () => {
      const { data } = await axios.get(
        `/api/events/top?month=${encodeURIComponent(month)}&count=${count}`
      );
      return { ...data, results: data.results.slice(0, count) };
    },
    enabled: Boolean(month),   // month 없으면 요청 안 보냄
    staleTime: 5 * 60 * 1000,  // 5분
    retry: 1,
    keepPreviousData: true,
  });
};
