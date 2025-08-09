import  { create } from 'zustand'

const useMyReviewStore = create((set) => ({
    reviews: [],
    setReviews: (data) => set({ reviews: data})
}))

export default useMyReviewStore;