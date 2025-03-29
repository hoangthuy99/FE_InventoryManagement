import { create } from "zustand";
import { areaAPI, branchAPI } from "../api/api";

var baseData = {
  id: "",
  name: "",
  posX: 500 + Math.random() * 5,
  posY: 500 + Math.random() * 5,
  capacity: 0,
  description: "",
  branchId: 0,
  isModify: true,
};

const mapMode = {
  readonly: 1,
  create: 2,
  update: 3,
  delete: 4,
};

const useMapStore = create((set, get) => ({
  areas: [],
  branchs: [],
  branchSelected: 0,
  areaSelected: baseData,
  mode: mapMode.readonly,
  mapMode: mapMode,
  deleteAreas: [],

  resetAreaSelected: () => set({ areaSelected: baseData }),
  setAreas: (newAreas) => set({ areas: newAreas || [] }),
  setBranchSelected: (branch) => set({ branchSelected: branch }),
  setAreaSelected: (area) => set({ areaSelected: area }),
  setMode: (mode) => set({ mode }),
  setDeleteAreas: (areas) => set({deleteAreas: areas || []}),

  // Get all branchs
  fetchAllBranch: async () => {
    try {
      const response = await branchAPI.getAll();
      const data = response.data;
      if (data) {
        set({ branchs: data });
        set({ branchSelected: data[0].id });
      }
    } catch (error) {
      console.error("Lỗi khi gọi API chi nhánh:", error);
    }
  },

  // Get area by branch id
  fetchAreaByBranch: async (branchId) => {
    try {
      const response = await areaAPI.getByBranch(branchId);
      const data = response.data?.data;

      if (data) {
        set({
          areas: data?.map((a) => {
            return get().mode === mapMode.update ? { ...a, isModify: true } : a;
          }),
        });
      }
    } catch (error) {
      console.error("Lỗi khi gọi API khu vực:", error);
    }
  },
}));

export default useMapStore;
