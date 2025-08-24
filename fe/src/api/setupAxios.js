import axios from "axios";
import useAuthStore from "../store/useAuthStore";

const RAW = (process.env.REACT_APP_API_BASE || process.env.REACT_APP_API_BASE_URL || "").trim();
axios.defaults.baseURL = RAW || undefined;
axios.defaults.headers.common["Accept"] = "application/json";

axios.interceptors.request.use((config) => {
  const s = useAuthStore.getState?.();
  const t =
    s?.accessToken || s?.token || s?.access ||
    localStorage.getItem("accessToken") || "";
  if (t && t !== "null" && t !== "undefined") {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${t}`;
  }
  return config;
});
