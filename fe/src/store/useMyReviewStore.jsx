import  { create } from 'zustand'

const useMyReviewStore = create((set) => ({
    reviews: [],
    setReviews: (data) => set({ reviews: data}),
    addReview: (review) => set((state) => ({ reviews: [...state.reviews, review]})),
    removeReview: (id) =>
        set((state) => ({
            reviews: state.reviews.filter((r) => r.id !== id),
        })),
}));

export default useMyReviewStore;