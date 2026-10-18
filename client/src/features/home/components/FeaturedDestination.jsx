// by claude: section redesigned (left title + "View all" link, 4 column grid)
import { useNavigate } from "react-router-dom";
import Title from "@/shared/components/ui/Title";
import HotelCard from "@/features/hotels/components/HotelCard";
import HotelCardSkeleton from "@/features/hotels/components/HotelCardSkeleton";
import { useAppStore } from "@/store/useAppStore";
import {
  useNewestHotels,
  useRecommendedHotels,
} from "@/features/hotels/hooks/useHotels"; // by claude

const FeaturedDestination = () => {
  const navigate = useNavigate();
  const hotelsLoading = useAppStore((state) => state.hotelsLoading);

  // by claude: the 4 newest hotels on the site (skipping the ones already in "Recommended")
  const newest = useNewestHotels();
  const recommended = useRecommendedHotels();
  const recommendedIds = new Set(recommended.map((h) => h.id));
  const featuredHotels = newest.filter((h) => !recommendedIds.has(h.id));

  if (!hotelsLoading && featuredHotels.length === 0) return null;

  return (
    <section className="px-6 md:px-16 lg:px-24 xl:px-32 py-16 md:py-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <Title
          align="left"
          title="Newly Added Hotels"
          subTitle="The latest hotels to join our platform."
        />
        <button
          onClick={() => {
            navigate("/rooms");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="shrink-0 self-start md:self-auto text-sm font-medium text-gray-900 underline underline-offset-4 hover:text-primary transition-colors cursor-pointer"
        >
          View all →
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10 mt-10">
        {hotelsLoading
          ? Array.from({ length: 4 }, (_, i) => <HotelCardSkeleton key={i} />)
          : featuredHotels
              .slice(0, 4)
              .map((hotel, index) => (
                <HotelCard key={hotel.id} hotel={hotel} index={index} />
              ))}
      </div>
    </section>
  );
};

export default FeaturedDestination;
