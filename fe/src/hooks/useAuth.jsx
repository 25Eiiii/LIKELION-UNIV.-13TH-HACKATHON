import useAuthStore from "../store/useAuthStore";
import axios from "axios";

const { data } = await axios.post("/api/accounts/login/", {username, password });

localStorage.setItem("access", data.access);
localStorage.setItem("refresh", data.refresh);
useAuthStore.getState().setUser(data.user);