import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { api } from "../api/fetcher"

export const useCategoryEvents = (category, search = "") => {
  return useQuery({
    queryKey: ["category-events", category, search],
    queryFn: async () => {
      const { data } = await axios.get("/api/events/events-category/", {
        params: {
          category,                // ex) "무대/공연"
          ...(search ? { search } : {}),
        },
      });
      // data: { category, search, count, results: [...] }
      return data;
    },
    enabled: Boolean(category),
    staleTime: 5 * 60 * 1000,
    keepPreviousData: true,
    retry: (n, err) => (err?.response?.status === 404 ? false : n < 1),
  });
};
