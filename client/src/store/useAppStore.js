import { create } from "zustand";
import toast from "react-hot-toast";
import { getHotels } from "@/features/hotels/api";
import { getUser } from "@/features/users/api";

export const useAppStore = create((set, get) => ({
  currency: import.meta.env.VITE_CURRENCY || "$",
  isOwner: false,
  userLoaded: false, // by claude: true once the role was fetched (avoids redirect on refresh)
  showHotelReg: false,
  searchedCities: [],
  hotels: [], // by claude: light list of hotels (cover, from-price, rating) for Home. Rooms are fetched per page.
  hotelsLoading: true, // by claude: true until the first fetch is done (shows skeletons)

  setIsOwner: (isOwner) => set({ isOwner }),
  resetUser: () => set({ isOwner: false, userLoaded: false, searchedCities: [] }), // by claude
  setShowHotelReg: (showHotelReg) => set({ showHotelReg }),
  setSearchedCities: (searchedCities) => set({ searchedCities }),
  fetchUser: async (getToken) => {
    try {
      const token = await getToken();
      const { data } = await getUser({
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

  // by claude: hotels for Home (replaces loading ALL rooms): GET /api/hotels
  fetchHotels: async () => {
    // on the first load keep the skeleton at least ~1s so it doesn't flash
    const minDelay = get().hotelsLoading
      ? new Promise((resolve) => setTimeout(resolve, 1000))
      : null;
    try {
      const { data } = await getHotels();
      if (data.success) {
        set({ hotels: data.hotels });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      await minDelay;
      set({ hotelsLoading: false });
    }
  },
}));
