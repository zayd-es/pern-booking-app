import Title from "../../common/Title";
import { useAppStore } from "../../../store/useAppStore";
import { useMemo } from "react";
import HotelCard from "../../common/HotelCard";

const RecommendedHotels = () => {
  const searchedCities = useAppStore((state) => state.searchedCities);
  const rooms = useAppStore((state) => state.rooms);

  const recommendedHotels = useMemo(() => {
    if (
      !searchedCities ||
      !Array.isArray(searchedCities) ||
      searchedCities.length === 0
    ) {
      return [];
    }
    return rooms.filter((room) => searchedCities.includes(room.hotel?.city));
  }, [rooms, searchedCities]);

  if (recommendedHotels.length === 0) return null;

  return (
    <div className="flex flex-col items-center px-6 md:px-16 lg:px-24 bg-slate-50 py-16 md:py-20">
      <Title
        title="Recommended Hotels"
        subTitle="Discover our handpicked selection of exceptional properties around the world, offering unparalleled luxury and unforgettable experiences."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl mt-12 md:mt-16 justify-items-center">
        {recommendedHotels.slice(0, 4).map((room, index) => (
          <HotelCard key={room._id} room={room} index={index} />
        ))}
      </div>
    </div>
  );
};

export default RecommendedHotels;
