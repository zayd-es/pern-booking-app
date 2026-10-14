import { create } from "zustand";
import toast from "react-hot-toast";
import API from "../lib/axios";

export const useAppStore = create((set, get) => ({
  currency: import.meta.env.VITE_CURRENCY || "$",
  isOwner: false,
  userLoaded: false, // by claude: true once the role was fetched (avoids redirect on refresh)
  showHotelReg: false,
  searchedCities: [],
  rooms: [],
  roomsLoading: true, // by claude: true until the first fetch is done (shows skeletons)

  setIsOwner: (isOwner) => set({ isOwner }),
  resetUser: () => set({ isOwner: false, userLoaded: false, searchedCities: [] }), // by claude
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
    } finally {
      set({ userLoaded: true }); // by claude
    }
  },

  fetchRooms: async () => {
    // by claude: on the first load keep the skeleton at least ~1s so it doesn't flash
    const minDelay = get().roomsLoading
      ? new Promise((resolve) => setTimeout(resolve, 1000))
      : null;
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
    } finally {
      await minDelay; // by claude
      set({ roomsLoading: false });
    }
  },
}));
