import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import usePointStore from "../store/usePointStore";

// 데이터 불러오기  
const fetchPoint = async () => {
    const token = localStorage.getItem("accessToken");
    const res = await axios.get("/api/points/my/", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    console.log("data: ", res.data.point);
    return res.data
}

// usePoint 훅
export const usePoint = () => {
    const setPoint = usePointStore((state) => state.setPoint);

    return useQuery({
        queryKey: ["point"],
        queryFn: fetchPoint,
        onSuccess: (data) => setPoint(data),
    });
}