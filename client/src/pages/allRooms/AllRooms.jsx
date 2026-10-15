// by claude: rooms page redesigned. Compact filter bar on top, grid of cards (up to 4 per row)
// and numbered pagination (12 rooms per page).
// by claude: filtering, sorting and pagination now happen on the SERVER (GET /api/rooms), the page
// only receives the 12 rooms it shows.
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import { X } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import API from "../../lib/axios"; // by claude
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
// by claude: label shown in the UI -> value understood by the API
const SORT_PARAM = {
  "Price Low to High": "price-asc",
  "Price High to Low": "price-desc",
  "Newest First": "newest",
};

const AllRooms = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const hotels = useAppStore((state) => state.hotels);
  const currency = useAppStore((state) => state.currency);

  const [filters, setFilters] = useState({
    roomType: [],
    amenities: [],
    minPrice: null, // null = no limit
    maxPrice: null,
  });
  const [selectedSort, setSelectedSort] = useState("");
  const [page, setPage] = useState(1);

  // by claude: data of the current page, as returned by the server
  const [pageRooms, setPageRooms] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [serverBounds, setServerBounds] = useState({ min: 0, max: 500 });
  const [roomsLoading, setRoomsLoading] = useState(true);

  // price slider bounds = real prices of all available rooms (rounded to 10)
  const bounds = {
    min: Math.floor(serverBounds.min / 10) * 10,
    max: Math.ceil(serverBounds.max / 10) * 10,
  };

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
  const selectedHotel = hotels.find((h) => h.id === hotelId);
  const currentPage = page;

  // by claude: ask the server for the current page whenever a filter / sort / page changes
  // (small delay so dragging the price slider doesn't send a request per pixel)
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      setRoomsLoading(true);
      try {
        const params = { page, limit: PAGE_SIZE };
        if (filters.roomType.length) params.roomType = filters.roomType.join(",");
        if (filters.amenities.length) params.amenities = filters.amenities.join(",");
        if (filters.minPrice !== null) params.minPrice = filters.minPrice;
        if (filters.maxPrice !== null) params.maxPrice = filters.maxPrice;
        if (SORT_PARAM[selectedSort]) params.sort = SORT_PARAM[selectedSort];
        if (hotelId) params.hotel = hotelId;
        if (destination) params.destination = destination;

        const { data } = await API.get("/api/rooms", { params });
        if (cancelled || !data.success) return;
        setPageRooms(data.rooms);
        setTotal(data.pagination.total);
        setTotalPages(data.pagination.totalPages);
        setServerBounds(data.bounds);
        // a filter can leave fewer pages than the current one -> go back to the last page
        if (page > data.pagination.totalPages) setPage(data.pagination.totalPages);
      } catch {
        if (!cancelled) setPageRooms([]);
      } finally {
        if (!cancelled) setRoomsLoading(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [page, filters, selectedSort, hotelId, destination]);

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
    <div className="pt-24 sm:pt-28 md:pt-32 pb-16 md:pb-20 px-4 md:px-12 lg:px-16 xl:px-24 2xl:px-32">
      <FadeIn>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-gray-900">
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
            : `${total} room${total === 1 ? "" : "s"} found`}
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

      <div className="mt-5 grid grid-cols-1 gap-x-5 gap-y-8 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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

      {!roomsLoading && total === 0 && (
        <p className="py-16 text-center text-gray-500">
          No rooms match your filters.
        </p>
      )}

      {!roomsLoading && (
        <Pagination
          page={currentPage}
          totalPages={totalPages}
          onChange={goToPage}
          className="mt-10 sm:mt-12"
        />
      )}
    </div>
  );
};

export default AllRooms;
