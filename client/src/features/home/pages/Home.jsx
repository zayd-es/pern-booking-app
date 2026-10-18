import FeaturedDestination from "@/features/home/components/FeaturedDestination";
import Hero from "@/features/home/components/Hero";
import NewsLetter from "@/features/home/components/NewsLetter";
import RecommendedHotels from "@/features/home/components/RecommendedHotels";
const Home = () => {
  return (
    <>
      <Hero />
      <RecommendedHotels />
      <FeaturedDestination />
      <NewsLetter />
    </>
  );
};

export default Home;
