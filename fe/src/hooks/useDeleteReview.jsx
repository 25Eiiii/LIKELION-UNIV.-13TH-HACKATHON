// hooks/useDeleteReview.js (새 파일)
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "";

const deleteReviewAPI = async ({ reviewId, token }) => {
  await axios.delete(`${API_BASE}/api/surveys/my-reviews/${reviewId}/`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return reviewId;
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteReviewAPI,
    onMutate: async (variables) => {
      const { reviewId } = variables;

      await queryClient.cancelQueries({ queryKey: ["my-reviews"] });

      const previousReviews = queryClient.getQueryData(["my-reviews"]);

      queryClient.setQueryData(["my-reviews"], (oldData) => {
        if (!oldData) return [];
        return oldData.filter((review) => review.id !== reviewId);
      });

      return { previousReviews };
    },
    onError: (err, variables, context) => {
      if (context.previousReviews) {
        queryClient.setQueryData(["my-reviews"], context.previousReviews);
      }
      alert("삭제 중 오류가 발생했습니다.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["my-reviews"] });
    },
    onSuccess: () => {
      alert("후기가 삭제되었습니다.");
    },
  });
};