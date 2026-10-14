// by claude: rooms page redesigned. Compact filter bar on top, grid of cards (up to 4 per row)
// and numbered pagination (12 rooms per page).
import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import { X } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import RoomCard from "./_components/RoomCard";
import FilterBar from "./_components/FilterBar";
import RoomCardSkeleton from "./_components/RoomCardSkeleton";
import FadeIn from "../../components/common/FadeIn";
import Pagination from "../../components/common/Pagination";

const PAGE_SIZE = 12;

const roomTypes = ["Single Bed", "Double Bed", "Luxury Room", "Family Suite"];
const amenityOptions = [
  "Free WiFi",
  "Free Breakfast",
  "Room Service",
  "Mountain View",
  "Pool Access",
];
const sortOptions = ["Price Low to High", "Price High to Low", "Newest First"];

const AllRooms = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const rooms = useAppStore((state) => state.rooms);
  const roomsLoading = useAppStore((state) => state.roomsLoading);
  const currency = useAppStore((state) => state.currency);

  const [filters, setFilters] = useState({
    roomType: [],
    amenities: [],
    minPrice: null, // null = no limit
    maxPrice: null,
  });
  const [selectedSort, setSelectedSort] = useState("");
  const [page, setPage] = useState(1);

  // price bounds come from the real prices of the rooms
  const bounds = useMemo(() => {
    if (!rooms.length) return { min: 0, max: 500 };
    const prices = rooms.map((r) => r.pricePerNight);
    return {
      min: Math.floor(Math.min(...prices) / 10) * 10,
      max: Math.ceil(Math.max(...prices) / 10) * 10,
    };
  }, [rooms]);

  // every change of a filter goes back to page 1
  const handleToggle = (key, value) => {
    setPage(1);
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((item) => item !== value)
        : [...prev[key], value],
    }));
  };

  const handlePrice = (minPrice, maxPrice) => {
    setPage(1);
    setFilters((prev) => ({
      ...prev,
      minPrice: minPrice <= bounds.min ? null : minPrice,
      maxPrice: maxPrice >= bounds.max ? null : maxPrice,
    }));
  };

  const handleSort = (value) => {
    setPage(1);
    setSelectedSort(value);
  };

  // ?hotel=<id> / ?destination=<city> (coming from a card or the search bar)
  const hotelId = searchParams.get("hotel");
  const destination = searchParams.get("destination");
  const selectedHotel = rooms.find((r) => r.hotelId === hotelId)?.hotel;

  const filteredRooms = useMemo(() => {
    const matches = (room) =>
      (filters.roomType.length === 0 ||
        filters.roomType.includes(room.roomType)) &&
      (filters.minPrice === null || room.pricePerNight >= filters.minPrice) &&
      (filters.maxPrice === null || room.pricePerNight <= filters.maxPrice) &&
      filters.amenities.every((a) =>
        (room.amenities || []).some(
          (item) => item.toLowerCase() === a.toLowerCase(),
        ),
      ) &&
      (!hotelId || room.hotelId === hotelId) &&
      (!destination ||
        room.hotel.city.toLowerCase().includes(destination.toLowerCase()));

    const sorters = {
      "Price Low to High": (a, b) => a.pricePerNight - b.pricePerNight,
      "Price High to Low": (a, b) => b.pricePerNight - a.pricePerNight,
      "Newest First": (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    };

    const list = rooms.filter(matches);
    return sorters[selectedSort] ? list.sort(sorters[selectedSort]) : list;
  }, [rooms, filters, selectedSort, hotelId, destination]);

  const totalPages = Math.max(1, Math.ceil(filteredRooms.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRooms = filteredRooms.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const activeCount =
    filters.roomType.length +
    filters.amenities.length +
    (filters.minPrice !== null || filters.maxPrice !== null ? 1 : 0) +
    (selectedSort ? 1 : 0);

  const clearFilter = () => {
    setPage(1);
    setFilters({ roomType: [], amenities: [], minPrice: null, maxPrice: null });
    setSelectedSort("");
  };

  const goToPage = (p) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearSearchParam = (key) => {
    setPage(1);
    const next = new URLSearchParams(searchParams);
    next.delete(key);
    setSearchParams(next);
  };

  return (
    <div className="pt-28 md:pt-32 pb-20 px-4 md:px-16 lg:px-24 xl:px-32">
      <FadeIn>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-gray-900">
          Hotel Rooms
        </h1>
        <p className="mt-2 text-sm md:text-base text-gray-500">
          Find the right room, compare prices and book in a few clicks.
        </p>
      </FadeIn>

      <div className="mt-6">
        <FilterBar
          roomTypes={roomTypes}
          amenities={amenityOptions}
          sortOptions={sortOptions}
          bounds={bounds}
          filters={filters}
          sort={selectedSort}
          onToggle={handleToggle}
          onPrice={handlePrice}
          onSort={handleSort}
          onClear={clearFilter}
          activeCount={activeCount}
          currency={currency}
        />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-gray-500">
        <span>
          {roomsLoading
            ? "Loading rooms..."
            : `${filteredRooms.length} room${filteredRooms.length === 1 ? "" : "s"} found`}
        </span>
        {hotelId && selectedHotel && (
          <button
            onClick={() => clearSearchParam("hotel")}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-gray-700 hover:bg-gray-200"
          >
            {selectedHotel.name} <X className="h-3.5 w-3.5" />
          </button>
        )}
        {destination && (
          <button
            onClick={() => clearSearchParam("destination")}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-gray-700 hover:bg-gray-200"
          >
            {destination} <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {roomsLoading
          ? Array.from({ length: 8 }, (_, i) => <RoomCardSkeleton key={i} />)
          : pageRooms.map((room, index) => (
              <motion.div
                key={room._id || room.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: (index % 4) * 0.05 }}
              >
                <RoomCard room={room} currency={currency} navigate={navigate} />
              </motion.div>
            ))}
      </div>

      {!roomsLoading && filteredRooms.length === 0 && (
        <p className="py-16 text-center text-gray-500">
          No rooms match your filters.
        </p>
      )}

      {!roomsLoading && (
        <Pagination
          page={currentPage}
          totalPages={totalPages}
          onChange={goToPage}
          className="mt-12"
        />
      )}
    </div>
  );
};

export default AllRooms;
