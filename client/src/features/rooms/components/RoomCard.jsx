// by claude: compact vertical card (photo on top) so 3-4 rooms fit on one row
import { MapPin } from "lucide-react";
import RatingBadge from "../../../components/common/RatingBadge"; // by claude
import FacilityIcon from "../../../components/common/FacilityIcon";

const RoomCard = ({ room, currency, navigate }) => {
  const handleRoomClick = () => {
    navigate(`/rooms/${room._id || room.id}`);
    window.scrollTo(0, 0);
  };

  const amenities = room.amenities || [];

  return (
    <div
      onClick={handleRoomClick}
      className="group cursor-pointer"
      role="link"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleRoomClick()}
    >
      <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-gray-100">
        <img
          src={room.images[0]}
          alt={room.hotel.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute top-3 left-3 rounded-full bg-white/95 px-3 py-1 text-xs font-medium text-gray-800 shadow-sm">
          {room.roomType}
        </span>
      </div>

      <div className="pt-3">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate font-medium text-gray-900">{room.hotel.name}</p>
          <RatingBadge rating={room.hotel.rating} />
        </div>

        <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-gray-500">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">
            {room.hotel.city}
            {room.hotel.address ? `, ${room.hotel.address}` : ""}
          </span>
        </p>

        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-gray-900">
              {currency}
              {room.pricePerNight}
            </span>{" "}
            / night
          </p>
          <div className="flex items-center gap-2 text-gray-500">
            {amenities.slice(0, 4).map((item) => (
              <span key={item} title={item}>
                <FacilityIcon name={item} className="h-4 w-4" />
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
