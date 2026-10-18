import FeaturedDestanition from "../components/home/card/FeaturedDestanition";
import Hero from "../components/home/hero/Hero";
import NewsLetter from "../components/home/newsLetter/NewsLetter";
import RecommendedHotels from "../components/home/recommendedHotels/RecommendedHotels";
const Home = () => {
  return (
    <>
      <Hero />
      <RecommendedHotels />
      <FeaturedDestanition />
      <NewsLetter />
    </>
  );
};

export default Home;
