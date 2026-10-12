import { create } from "zustand";
import toast from "react-hot-toast";
import API from "../lib/axios";

export const useAppStore = create((set, get) => ({
  currency: import.meta.env.VITE_CURRENCY || "$",
  isOwner: false,
  showHotelReg: false,
  searchedCities: [],
  rooms: [],

  setIsOwner: (isOwner) => set({ isOwner }),
  setShowHotelReg: (showHotelReg) => set({ showHotelReg }),
  setSearchedCities: (searchedCities) => set({ searchedCities }),
  setRooms: (rooms) => set({ rooms }),
  fetchUser: async (getToken) => {
    try {
      const token = await getToken();
      const { data } = await API.get("/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        set({
          isOwner: data.role === "hotelOwner",
          searchedCities: data.recentSearchedCities || [],
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  },

  fetchRooms: async () => {
    try {
      const { data } = await API.get("/api/rooms");
      if (data.success) {
        set({
          rooms: data.rooms,
        });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  },
}));
