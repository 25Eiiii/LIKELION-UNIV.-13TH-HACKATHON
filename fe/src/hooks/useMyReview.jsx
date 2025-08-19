import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import useMyReviewStore from "../store/useMyReviewStore";

// 데이터 불러오기
const fetchMyReviews = async () => {
    const { setReviews } = useMyReviewStore.getState();
    const token = localStorage.getItem("accessToken");
    const res = await axios.get("/api/surveys/my-reviews/", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    setReviews(res.data);
    return res.data;
}

// useMyReviews 훅
export const useMyReviews = () => {
    const setReviews = useMyReviewStore((state) => state.setReviews);

    return useQuery({
        queryKey: ["myReviews"],
        queryFn: fetchMyReviews,
        onSuccess: (data) => setReviews(data),
    });
};