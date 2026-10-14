import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppStore } from "../../store/useAppStore";
import RoomCard from "./_components/RoomCard";
import FilterSidebar from "./_components/FilterSidebar";
import FadeIn from "../../components/common/FadeIn"; // by claude
import RoomCardSkeleton from "./_components/RoomCardSkeleton"; // by claude
import { AnimatePresence, motion } from "motion/react"; // by claude

const AllRooms = () => {
  const navigate = useNavigate();
  const [openFilters, setOpenFilters] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const rooms = useAppStore((state) => state.rooms);
  const roomsLoading = useAppStore((state) => state.roomsLoading); // by claude
  const currency = useAppStore((state) => state.currency);

  const [selectedFilters, setSelectedFilters] = useState({
    roomType: [],
    priceRange: [],
  });
  const [selectedSort, setSelectedSort] = useState("");

  const roomTypes = ["Single Bed", "Double Bed", "Luxury Room", "Family Suite"];
  const priceRanges = [
    "0 to 500",
    "500 to 1000",
    "1000 to 2000",
    "2000 to 3000",
  ];
  const sortOptions = [
    "Price Low to High",
    "Price High to Low",
    "Newest First",
  ];

  const handleFilterChange = (checked, value, type) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [type]: checked
        ? [...prev[type], value]
        : prev[type].filter((item) => item !== value),
    }));
  };

  const handleSortChange = (sortOption) => {
    setSelectedSort(sortOption);
  };

  const matchesRoomType = (room) => {
    return (
      selectedFilters.roomType.length === 0 ||
      selectedFilters.roomType.includes(room.roomType)
    );
  };

  const matchesPriceRanges = (room) => {
    return (
      selectedFilters.priceRange.length === 0 ||
      selectedFilters.priceRange.some((range) => {
        const [min, max] = range.split(" to ").map(Number);
        return room.pricePerNight >= min && room.pricePerNight <= max;
      })
    );
  };

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
          matchesPriceRanges(room) &&
          filterHotel(room) &&
          filterDestination(room),
      )
      .sort(sortRooms);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rooms, selectedFilters, selectedSort, searchParams]);

  const clearFilter = () => {
    setSelectedFilters({
      roomType: [],
      priceRange: [],
    });
    setSelectedSort("");
    setSearchParams({});
  };

  return (
    <div className="flex flex-col-reverse lg:flex-row items-start justify-between pt-28 md:pt-35 px-4 md:px-16 lg:px-24 xl:px-32">
      {/* Rooms List */}
      <div className="w-full lg:w-3/4">
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
          <p className="mt-3 text-sm text-gray-400">
            {roomsLoading
              ? "Loading rooms..."
              : `${filteredRooms.length} room${filteredRooms.length === 1 ? "" : "s"} found`}
          </p>
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
        openFilters={openFilters}
        setOpenFilters={setOpenFilters}
        clearFilter={clearFilter}
        roomTypes={roomTypes}
        priceRanges={priceRanges}
        sortOptions={sortOptions}
        selectedFilters={selectedFilters}
        selectedSort={selectedSort}
        handleFilterChange={handleFilterChange}
        handleSortChange={handleSortChange}
        currency={currency}
      />
    </div>
  );
};

export default AllRooms;
