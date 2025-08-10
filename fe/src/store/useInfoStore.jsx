import { create } from "zustand";

const useInterestStore = create((set) => ({
  selectedInterests: [],
  toggleInterest: (interestIdx) =>
    set((state) => {
      const exists = state.selectedInterests.includes(interestIdx);
      let newSelected;

      if (exists) {
        // 이미 선택된 항목이면 제거
        newSelected = state.selectedInterests.filter((idx) => idx !== interestIdx);
      } else if (state.selectedInterests.length < 3) {
        // 아직 3개 미만이면 추가
        newSelected = [...state.selectedInterests, interestIdx];
      } else {
        // 3개 이미 선택됐으면 아무 변화 없음
        newSelected = state.selectedInterests;
      }

      return { selectedInterests: newSelected };
    }),
}));

export default useInterestStore;

export const useTogetherStore = create((set) => ({
    selectedTogether: null,
    setSelectedTogether: (togetherIdx) => 
        set({ selectedTogether: togetherIdx })
}));

export const useAreaStore = create((set) => ({
  selectedArea: null,
  setSelectedArea: (areaIdx) =>
    set({ selectedArea: areaIdx })
}))

export const useFeeStore = create((set) => ({
  selectedFee: null,
  setSelectedFee: (FeeIdx) =>
    set({ selectedFee: FeeIdx })
}))