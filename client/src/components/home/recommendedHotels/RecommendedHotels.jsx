// by claude: section redesigned (same grid as featured), fixed key (_id -> id)
import Title from "../../common/Title";
import { useAppStore } from "../../../store/useAppStore";
import { useRecommendedHotels } from "../../../lib/useHotels"; // by claude
import HotelCard from "../../common/HotelCard";
import HotelCardSkeleton from "../../common/HotelCardSkeleton"; // by claude

const RecommendedHotels = () => {
  const searchedCities = useAppStore((state) => state.searchedCities);
  const roomsLoading = useAppStore((state) => state.roomsLoading); // by claude

  const recommendedHotels = useRecommendedHotels(); // by claude

  // by claude: while loading, show skeletons only if the user has searched cities
  const showSkeleton = roomsLoading && searchedCities?.length > 0;
  if (!showSkeleton && recommendedHotels.length === 0) return null;

  return (
    <section className="px-6 md:px-16 lg:px-24 xl:px-32 bg-gray-50 py-16 md:py-20">
      <Title
        align="left"
        title="Recommended for you"
        subTitle="Hotels in the cities you searched for recently."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10 mt-10">
        {showSkeleton
          ? Array.from({ length: 4 }, (_, i) => <HotelCardSkeleton key={i} />)
          : recommendedHotels
              .slice(0, 4)
              .map((hotel, index) => (
                <HotelCard key={hotel.id} hotel={hotel} index={index} />
              ))}
      </div>
    </section>
  );
};

export default RecommendedHotels;
