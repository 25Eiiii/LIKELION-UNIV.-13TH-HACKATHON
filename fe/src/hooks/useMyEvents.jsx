import { useQuery } from "@tanstack/react-query";
import axios from "axios"
import useMyEventStore from "../store/useMyEventStore";

// 데이터 불러오기 
const fetchMyEvents = async () =>  {
    const token =  localStorage.getItem("accessToken");
    const res = await axios.get("/api/surveys/my-events/", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return res.data;
};

// useMyEvents 훅
export const useMyEvents = () => {
    const setEvents = useMyEventStore((state) => state.setEvents);

    // 데이터 불러오기 
    return useQuery({
        queryKey: ["myEvents"],
        queryFn: fetchMyEvents,
        onSuccess: (data) => setEvents(data),
    });
};