// by claude: hero redesigned (light, minimal, photo collage instead of the old dark background)
import { SearchForm } from "@/features/home/components/SearchForm";
// by claude: photos from Unsplash instead of local files
const roomImg1 = "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80";
const roomImg2 = "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80";
const roomImg3 = "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80";

const Hero = () => {
  return (
    <section className="px-6 md:px-16 lg:px-24 xl:px-32 pt-28 md:pt-32 pb-16 md:pb-24">
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3.5 py-1 text-xs font-medium text-gray-600">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            The Ultimate Hotel Experience
          </span>

          <h1 className="mt-5 text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-gray-900 leading-[1.05]">
            Find the stay that feels like home.
          </h1>

          <p className="mt-5 max-w-lg text-base md:text-lg text-gray-500">
            Browse handpicked hotels and rooms, compare prices and book your
            next trip in a few clicks.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-4 h-72 sm:h-96 lg:h-[460px]">
          <img
            src={roomImg1}
            alt="Hotel room"
            className="row-span-2 h-full w-full rounded-3xl object-cover"
          />
          <img
            src={roomImg2}
            alt="Hotel room"
            className="h-full w-full rounded-3xl object-cover"
          />
          <img
            src={roomImg3}
            alt="Hotel room"
            className="h-full w-full rounded-3xl object-cover"
          />
        </div>
      </div>

      <div className="relative z-10 mt-10 lg:-mt-8 flex justify-center">
        <SearchForm />
      </div>
    </section>
  );
};

export default Hero;
