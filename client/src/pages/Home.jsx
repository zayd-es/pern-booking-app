import FeaturedDestanition from "../components/home/card/FeaturedDestanition";
import Hero from "../components/home/hero/Hero";
import NewsLetter from "../components/home/newsLetter/NewsLetter";
import ExclusiveOffers from "../components/home/offers/ExclusiveOffers";
import RecommendedHotels from "../components/home/recommendedHotels/RecommendedHotels";
import Testimonial from "../components/home/testimonial/Testimonial";
const Home = () => {
  return (
    <>
      <Hero />
      <RecommendedHotels />
      <FeaturedDestanition />
      <ExclusiveOffers />
      <Testimonial />
      <NewsLetter />
    </>
  );
};

export default Home;
