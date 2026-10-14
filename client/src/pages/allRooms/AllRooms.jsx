import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppStore } from "../../store/useAppStore";
import RoomCard from "./_components/RoomCard";
import FilterSidebar from "./_components/FilterSidebar";
import FadeIn from "../../components/common/FadeIn"; // by claude
import RoomCardSkeleton from "./_components/RoomCardSkeleton"; // by claude
import { AnimatePresence, motion } from "motion/react"; // by claude
import { ChevronDown } from "lucide-react"; // by claude

const AllRooms = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const rooms = useAppStore((state) => state.rooms);
  const roomsLoading = useAppStore((state) => state.roomsLoading); // by claude
  const currency = useAppStore((state) => state.currency);

  // by claude: filters redesigned. Price bounds come from the real prices of the rooms.
  const [filters, setFilters] = useState({
    roomType: [],
    amenities: [],
    minPrice: null, // null = no limit
    maxPrice: null,
  });
  const [selectedSort, setSelectedSort] = useState("");

  const roomTypes = ["Single Bed", "Double Bed", "Luxury Room", "Family Suite"];
  const amenityOptions = [
    "Free WiFi",
    "Free Breakfast",
    "Room Service",
    "Mountain View",
    "Pool Access",
  ];
  const sortOptions = [
    "Price Low to High",
    "Price High to Low",
    "Newest First",
  ];

  const bounds = useMemo(() => {
    if (!rooms.length) return { min: 0, max: 500 };
    const prices = rooms.map((r) => r.pricePerNight);
    return {
      min: Math.floor(Math.min(...prices) / 10) * 10,
      max: Math.ceil(Math.max(...prices) / 10) * 10,
    };
  }, [rooms]);

  const handleToggle = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((item) => item !== value)
        : [...prev[key], value],
    }));
  };

  const handlePrice = (minPrice, maxPrice) => {
    // back to "no limit" when the handles are at the ends
    setFilters((prev) => ({
      ...prev,
      minPrice: minPrice <= bounds.min ? null : minPrice,
      maxPrice: maxPrice >= bounds.max ? null : maxPrice,
    }));
  };

  const matchesRoomType = (room) =>
    filters.roomType.length === 0 || filters.roomType.includes(room.roomType);

  const matchesPrice = (room) =>
    (filters.minPrice === null || room.pricePerNight >= filters.minPrice) &&
    (filters.maxPrice === null || room.pricePerNight <= filters.maxPrice);

  const matchesAmenities = (room) =>
    filters.amenities.every((a) =>
      (room.amenities || []).some(
        (item) => item.toLowerCase() === a.toLowerCase(),
      ),
    );

  const activeCount =
    filters.roomType.length +
    filters.amenities.length +
    (filters.minPrice !== null || filters.maxPrice !== null ? 1 : 0) +
    (selectedSort ? 1 : 0);

  const sortRooms = (a, b) => {
    if (selectedSort === "Price Low to High") {
      return a.pricePerNight - b.pricePerNight;
    }
    if (selectedSort === "Price High to Low") {
      return b.pricePerNight - a.pricePerNight;
    }
    if (selectedSort === "Newest First") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    return 0;
  };

  // by claude: ?hotel=<id> shows only the rooms of that hotel (coming from a hotel card)
  const hotelId = searchParams.get("hotel");
  const selectedHotel = rooms.find((r) => r.hotelId === hotelId)?.hotel;
  const filterHotel = (room) => !hotelId || room.hotelId === hotelId;

  const filterDestination = (room) => {
    const destination = searchParams.get("destination");
    if (!destination) return true;
    return room.hotel.city.toLowerCase().includes(destination.toLowerCase());
  };

  const filteredRooms = useMemo(() => {
    return rooms
      .filter(
        (room) =>
          matchesRoomType(room) &&
          matchesPrice(room) &&
          matchesAmenities(room) &&
          filterHotel(room) &&
          filterDestination(room),
      )
      .sort(sortRooms);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rooms, filters, selectedSort, searchParams]);

  const clearFilter = () => {
    setFilters({ roomType: [], amenities: [], minPrice: null, maxPrice: null });
    setSelectedSort("");
    setSearchParams({});
  };

  return (
    <div className="flex flex-col-reverse lg:flex-row items-start justify-between lg:gap-10 pt-28 md:pt-35 px-4 md:px-16 lg:px-24 xl:px-32">
      {/* Rooms List */}
      <div className="w-full lg:flex-1 min-w-0">
        {/* by claude: animated header + animated list */}
        <FadeIn className="flex flex-col items-start text-left">
          <h1 className="font-playfair text-4xl md:text-[40px]">Hotel Rooms</h1>
          <p className="text-sm md:text-base text-gray-500/90 mt-2 max-w-174">
            Take advantage of our limited-time offers and special packages to
            enhance your stay and create unforgettable memories.
          </p>
          {hotelId && selectedHotel && (
            <button
              onClick={() => setSearchParams({})}
              className="mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200"
            >
              {selectedHotel.name} <span aria-hidden="true">✕</span>
            </button>
          )}
          {/* by claude: sort moved here (next to the count) to keep the filter panel short */}
          <div className="mt-3 flex w-full items-center justify-between gap-3">
            <p className="text-sm text-gray-400">
              {roomsLoading
                ? "Loading rooms..."
                : `${filteredRooms.length} room${filteredRooms.length === 1 ? "" : "s"} found`}
            </p>
            <div className="relative">
              <select
                aria-label="Sort rooms"
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="cursor-pointer appearance-none rounded-full border border-gray-200 bg-white py-1.5 pl-4 pr-9 text-sm text-gray-800 outline-none focus:border-gray-900"
              >
                <option value="">Sort: Recommended</option>
                {sortOptions.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            </div>
          </div>
        </FadeIn>

        {roomsLoading &&
          Array.from({ length: 3 }, (_, i) => <RoomCardSkeleton key={i} />)}

        <AnimatePresence mode="popLayout">
          {filteredRooms.map((room) => (
            <motion.div
              key={room._id || room.id}
              layout
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.35 }}
            >
              <RoomCard
                room={room}
                currency={currency}
                navigate={navigate}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {!roomsLoading && filteredRooms.length === 0 && (
          <p className="py-16 text-gray-500">No rooms match your filters.</p>
        )}
      </div>

      <FilterSidebar
        roomTypes={roomTypes}
        amenities={amenityOptions}
        bounds={bounds}
        filters={filters}
        onToggle={handleToggle}
        onPrice={handlePrice}
        onClear={clearFilter}
        activeCount={activeCount}
        currency={currency}
      />
    </div>
  );
};

export default AllRooms;
