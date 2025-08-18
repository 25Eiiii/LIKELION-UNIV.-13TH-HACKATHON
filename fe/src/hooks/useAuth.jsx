import useAuthStore from "../store/useAuthStore";

const { data } = await api.post("/api/accounts/login/", {username, password });

localStorage.setItem("access", data.access);
localStorage.setItem("refresh", data.refresh);
useAuthStore.getState().setUser(data.user);