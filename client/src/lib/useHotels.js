// by claude: the API returns rooms (each with its hotel). These hooks group them into HOTELS.
import { useMemo } from "react";
import { useAppStore } from "../store/useAppStore";

const RECOMMENDED_TOTAL = 4;
const RECOMMENDED_CITIES = 4; // searchedCities = last 4 searched cities, newest first

// one entry per hotel: cover photo + cheapest price + number of available rooms
export const useHotels = () => {
  const rooms = useAppStore((state) => state.rooms);

  return useMemo(() => {
    const byHotel = new Map();
    for (const room of rooms || []) {
      if (!room.hotel) continue;
      const entry = byHotel.get(room.hotelId) || {
        id: room.hotelId,
        name: room.hotel.name,
        city: room.hotel.city,
        country: room.hotel.country,
        createdAt: room.hotel.createdAt,
        image: null,
        minPrice: Infinity,
        roomsCount: 0,
      };
      entry.roomsCount += 1;
      if (room.pricePerNight < entry.minPrice) {
        entry.minPrice = room.pricePerNight;
        entry.image = room.images?.[0] || entry.image; // cover = cheapest room photo
      }
      byHotel.set(room.hotelId, entry);
    }
    return [...byHotel.values()];
  }, [rooms]);
};

// newest hotels first
export const useNewestHotels = () => {
  const hotels = useHotels();
  return useMemo(
    () =>
      [...hotels].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      ),
    [hotels],
  );
};

// 4 hotels in total from the last 4 searched cities (newest city first, 1 hotel each).
// A new search goes to the front and the oldest city drops out.
export const useRecommendedHotels = () => {
  const hotels = useNewestHotels();
  const searchedCities = useAppStore((state) => state.searchedCities);

  return useMemo(() => {
    if (!Array.isArray(searchedCities) || searchedCities.length === 0) {
      return [];
    }
    const cities = searchedCities.slice(0, RECOMMENDED_CITIES); // already newest first
    const perCity = Math.ceil(RECOMMENDED_TOTAL / cities.length); // 4 cities -> 1 each, 2 cities -> 2 each

    const groups = cities.map((city) =>
      hotels.filter((h) => h.city === city),
    );
    const picked = groups.flatMap((g) => g.slice(0, perCity)).slice(0, RECOMMENDED_TOTAL);
    // a city with fewer hotels than its share: fill the gap from the other searched cities,
    // then (still short) from the newest hotels elsewhere, so there are always 4
    if (picked.length < RECOMMENDED_TOTAL) {
      const leftovers = groups.flatMap((g) => g.slice(perCity));
      picked.push(...leftovers.slice(0, RECOMMENDED_TOTAL - picked.length));
    }
    if (picked.length < RECOMMENDED_TOTAL) {
      const pickedIds = new Set(picked.map((h) => h.id));
      const others = hotels.filter((h) => !pickedIds.has(h.id));
      picked.push(...others.slice(0, RECOMMENDED_TOTAL - picked.length));
    }
    return picked;
  }, [hotels, searchedCities]);
};
