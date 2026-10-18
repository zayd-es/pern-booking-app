// by claude: card now shows a HOTEL (not a room): cover photo, name, city, "from $X / night", rooms count
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import RatingBadge from "./RatingBadge"; // by claude
import { useAppStore } from "../../store/useAppStore";
import FadeIn from "./FadeIn";

const HotelCard = ({ hotel, index = 0 }) => {
  const currency = useAppStore((state) => state.currency);

  const location = [hotel.city, hotel.country].filter(Boolean).join(", ");

  return (
    <FadeIn delay={(index % 4) * 0.08} className="w-full">
      <Link
        to={`/hotels/${hotel.id}`} // by claude: hotel page
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="group block w-full"
      >
        <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-gray-100">
          <img
            src={hotel.image}
            alt={hotel.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <p className="absolute top-3 left-3 rounded-full bg-white/95 px-3 py-1 text-xs font-medium text-gray-800 shadow-sm">
            {hotel.roomsCount} room{hotel.roomsCount === 1 ? "" : "s"}
          </p>
        </div>

        <div className="pt-3">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate font-medium text-gray-900">{hotel.name}</p>
            <RatingBadge rating={hotel.rating} />
          </div>

          <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-gray-500">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{location || "Location unavailable"}</span>
          </p>

          <p className="mt-1.5 text-sm text-gray-500">
            From{" "}
            <span className="font-semibold text-gray-900">
              {currency}
              {hotel.minPrice}
            </span>{" "}
            / night
          </p>
        </div>
      </Link>
    </FadeIn>
  );
};

export default HotelCard;
