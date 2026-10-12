import { Link } from "react-router-dom";
import { assets } from "../../assets/assets";
import { useAppStore } from "../../store/useAppStore";

const HotelCard = ({ room, index }) => {
  const currency = useAppStore((state) => state.currency);

  return (
    <Link
      to={`/rooms/${room.id}`}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="relative block rounded-xl overflow-hidden bg-white text-gray-500/90 shadow-sm hover:shadow-md transition-all duration-300 w-full max-w-sm group border border-gray-100"
    >
      {/* 1. Image with Hover Zoom */}
      <div className="w-full h-48 overflow-hidden bg-gray-100">
        <img
          src={room.images?.[0]}
          alt={room.hotel?.name || "Hotel Room"}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 rounded-t-xl"
        />
      </div>

      {/* 2. Dynamic Best Seller Badge */}
      {index % 2 === 0 && (
        <p className="px-3 py-1 absolute top-3 left-3 text-xs bg-white/95 backdrop-blur-sm text-gray-800 font-medium rounded-full shadow-sm z-10">
          Best Seller
        </p>
      )}

      {/* 3. Card Content */}
      <div className="p-4 pt-5">
        {/* Title & Rating */}
        <div className="flex items-center justify-between gap-2">
          <p className="font-playfair text-xl font-medium text-gray-800 truncate">
            {room.hotel?.name || room.roomType || "Hotel Room"}
          </p>
          <div className="flex items-center gap-1 text-sm text-gray-700 shrink-0 font-medium">
            <img
              src={assets.starIconFilled}
              alt="star-icon"
              className="w-4 h-4"
            />
            <span>4.5</span>
          </div>
        </div>

        {/* Location Address */}
        <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-2">
          <img
            src={assets.locationIcon}
            alt="location-icon"
            className="w-3.5 h-3.5 shrink-0" // 👈 صلحنا الحجم هنا (كانت فيه w-full h-48)
          />
          <span className="truncate">
            {room.hotel?.address || "Location unavailable"}
          </span>
        </div>

        {/* Price & Book Button */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            <span className="text-xl font-semibold text-gray-900">
              {currency}
              {room.pricePerNight}
            </span>
            <span> /night</span>
          </p>
          <span className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg group-hover:bg-gray-900 group-hover:text-white group-hover:border-gray-900 transition-colors duration-200">
            Book Now
          </span>
        </div>
      </div>
    </Link>
  );
};

export default HotelCard;
