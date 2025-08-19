// hooks/usePoint.js
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import usePointStore from "../store/usePointStore";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

const fetchPoint = async () => {
  const token = localStorage.getItem("accessToken");
  const res = await axios.get(`${API_BASE}/api/points/my/`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const n = Number(res.data?.point) || 0;
  console.log("[usePoint] fetchPoint:", n);
  return n;
};

export const usePoint = (options = {}) => {
  const setPoint = usePointStore((s) => s.setPoint);

  const q = useQuery({
    queryKey: ["point"],
    queryFn: fetchPoint,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    // onSuccess는 '새 fetch' 때만 호출될 수 있음
    onSuccess: (value) => {
      console.log("[usePoint] onSuccess setPoint:", value);
      setPoint(value);
    },
    ...options,
  });

  // ✅ 캐시에서 읽어올 때도 스토어 동기화
  useEffect(() => {
    if (q.data != null) {
      console.log("[usePoint] effect setPoint:", q.data);
      setPoint(q.data);
    }
  }, [q.data, setPoint]);

  return q;
};
