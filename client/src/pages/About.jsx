// by claude: About page (story, real numbers from the store, how it works, call to action)
import { Link } from "react-router-dom";
import { Search, CalendarCheck, CreditCard, ShieldCheck, Heart, MapPin } from "lucide-react";
import FadeIn from "../components/common/FadeIn";
import { useAppStore } from "../store/useAppStore";
import { useHotels } from "../lib/useHotels";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1597212618440-806262de4f6b?auto=format&fit=crop&w=1600&q=80";

const STEPS = [
  { icon: Search, title: "Search", text: "Pick a city and browse hotels and rooms with clear prices and photos." },
  { icon: CalendarCheck, title: "Choose your dates", text: "Check availability instantly and book the room that fits you." },
  { icon: CreditCard, title: "Pay securely", text: "Pay online with Stripe and get your confirmation by email." },
];

const VALUES = [
  { icon: ShieldCheck, title: "Simple & transparent", text: "No hidden fees. The price you see is the price you pay." },
  { icon: Heart, title: "Made for Morocco", text: "From riads in the medina to camps in the Sahara, we focus on stays across the Kingdom." },
  { icon: MapPin, title: "Local hosts", text: "Hotel owners manage their own rooms, prices and availability directly on the platform." },
];

const About = () => {
  const hotels = useHotels();
  const rooms = useAppStore((state) => state.rooms);
  const setShowHotelReg = useAppStore((state) => state.setShowHotelReg);
  const citiesCount = new Set(hotels.map((h) => h.city)).size;

  // real numbers from the data (no invented statistics)
  const stats = [
    { value: hotels.length, label: "Hotels" },
    { value: rooms.length, label: "Rooms" },
    { value: citiesCount, label: "Cities" },
  ];

  return (
    <div className="pt-28 md:pt-32 pb-20 px-4 md:px-16 lg:px-24 xl:px-32">
      <FadeIn className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3.5 py-1 text-xs font-medium text-gray-600">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            About Zayd
          </span>
          <h1 className="mt-5 text-4xl sm:text-5xl font-semibold tracking-tight text-gray-900 leading-[1.05]">
            Finding a great stay in Morocco should be easy.
          </h1>
          <p className="mt-5 max-w-lg text-base md:text-lg text-gray-500">
            Zayd is a hotel booking platform built to connect travellers with
            welcoming hotels, riads and camps across Morocco, and to give
            hotel owners a simple way to manage their rooms and bookings.
          </p>
        </div>
        <img
          src={HERO_IMAGE}
          alt="Marrakech with the Atlas mountains"
          className="h-72 w-full rounded-3xl object-cover sm:h-96"
        />
      </FadeIn>

      <FadeIn className="mt-14 grid grid-cols-3 divide-x divide-gray-200 rounded-2xl border border-gray-200">
        {stats.map((s) => (
          <div key={s.label} className="px-4 py-6 text-center">
            <p className="text-3xl font-semibold text-gray-900">{s.value}</p>
            <p className="mt-1 text-sm text-gray-500">{s.label}</p>
          </div>
        ))}
      </FadeIn>

      <section className="mt-20">
        <FadeIn>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900">
            How it works
          </h2>
        </FadeIn>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <FadeIn key={step.title} delay={i * 0.08}>
              <div className="h-full rounded-2xl border border-gray-200 p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-900 text-white">
                  <step.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  {i + 1}. {step.title}
                </h3>
                <p className="mt-1.5 text-sm text-gray-500">{step.text}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      <section className="mt-20">
        <FadeIn>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900">
            What we believe in
          </h2>
        </FadeIn>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {VALUES.map((v, i) => (
            <FadeIn key={v.title} delay={i * 0.08}>
              <div className="flex gap-4">
                <v.icon className="mt-1 h-6 w-6 shrink-0 text-primary" />
                <div>
                  <h3 className="font-medium text-gray-900">{v.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{v.text}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      <FadeIn className="mt-20 flex flex-col items-center gap-5 rounded-3xl bg-gray-900 px-6 py-14 text-center text-white">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
          Ready for your next stay?
        </h2>
        <p className="max-w-md text-sm md:text-base text-white/70">
          Browse hotels across Morocco, or list your own and start welcoming guests.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            to="/rooms"
            onClick={() => window.scrollTo(0, 0)}
            className="rounded-full bg-white px-6 py-2.5 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-100"
          >
            Browse hotels
          </Link>
          <button
            onClick={() => setShowHotelReg(true)}
            className="cursor-pointer rounded-full border border-white/40 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            List your hotel
          </button>
        </div>
      </FadeIn>
    </div>
  );
};

export default About;
