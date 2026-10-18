// by claude: Experiences page (curated things to do in Morocco, each one links to hotels in that city)
import { Link } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";
import Title from "../components/common/Title";
import FadeIn from "../components/common/FadeIn";

const photo = (id) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=80`;

const EXPERIENCES = [
  {
    title: "Sahara Desert Trek",
    city: "Merzouga",
    description:
      "Ride a camel across the golden dunes of Erg Chebbi, watch the sunrise and sleep in a desert camp under the stars.",
    image: photo("1473116763249-2faaef81ccda"),
  },
  {
    title: "Medina & Culture",
    city: "Fes",
    description:
      "Get lost in the world's largest car-free medina, visit centuries-old tanneries, medersas and artisan workshops.",
    image: photo("1539020140153-e479b8c22e70"),
  },
  {
    title: "Kasbahs & Oases",
    city: "Ouarzazate",
    description:
      "Explore ancient kasbahs, palm groves and film studios along the road of a thousand kasbahs.",
    image: photo("1489749798305-4fea3ae63d43"),
  },
  {
    title: "Atlas Mountains",
    city: "Marrakech",
    description:
      "Escape the city for a day of hiking, Berber villages and mint tea with snow-capped peaks in the background.",
    image: photo("1597212618440-806262de4f6b"),
  },
  {
    title: "Surf & Coast",
    city: "Essaouira",
    description:
      "Catch Atlantic waves, wander the windy ramparts and eat fresh grilled fish straight from the port.",
    image: photo("1502680390469-be75c86b636f"),
  },
  {
    title: "Moroccan Cuisine",
    city: "Marrakech",
    description:
      "Join a cooking class, taste tagines and couscous, and discover the street food of Jemaa el-Fnaa.",
    image: photo("1541518763669-27fef04b14ea"),
  },
];

const Experiences = () => {
  return (
    <div className="pt-28 md:pt-32 pb-20 px-4 md:px-16 lg:px-24 xl:px-32">
      <FadeIn>
        <Title
          align="left"
          title="Experiences"
          subTitle="Morocco is more than a place to sleep. Pick an experience and find the perfect stay nearby."
        />
      </FadeIn>

      <div className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {EXPERIENCES.map((item, index) => (
          <FadeIn key={item.title} delay={(index % 3) * 0.08}>
            <Link
              to={`/rooms?destination=${encodeURIComponent(item.city)}`}
              onClick={() => window.scrollTo(0, 0)}
              className="group block"
            >
              <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-gray-100">
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1 text-xs font-medium text-gray-800">
                  <MapPin className="h-3 w-3" />
                  {item.city}
                </span>
              </div>
              <h3 className="mt-3 text-lg font-medium text-gray-900">
                {item.title}
              </h3>
              <p className="mt-1 text-sm text-gray-500">{item.description}</p>
              <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-gray-900 transition-all group-hover:gap-2.5">
                Find stays in {item.city}
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </FadeIn>
        ))}
      </div>
    </div>
  );
};

export default Experiences;
