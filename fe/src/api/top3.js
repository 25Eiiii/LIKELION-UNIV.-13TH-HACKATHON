import axios from "axios";
import { api, apiFetcher } from "../api/fetcher";

export async function fetchMonthlyTop3(params = {}) {
    try {
        const r = await api.get("/api/top3/monthly/", { params });
        const d = r.data;
        const has = (Array.isArray(d) && d.length) || (Array.isArray(d?.results) && d.results.length);
        if (has) return d;
    } catch (e) {
        if (!(axios.isAxiosError(e) && (e.response?.status === 401 || e.response?.status === 403))) {
            console.warn("monthly(private) failed:", e);
        }
    }
    const pub = await api.get("/api/top3/monthly/public/", { params });
    return pub.data;
}

export const normalizeTop3 = (d) => Array.isArray(d) ? d : (d?.results ?? []);
