import { MapPin } from "lucide-react"; // by claude
import FacilityIcon from "../../../components/common/FacilityIcon"; // by claude
import StarRating from "../../../components/common/StarRating";

// by claude: minimal restyle (no shadow, pill amenities)
const RoomCard = ({ room, currency, navigate }) => {
  const handleRoomClick = () => {
    navigate(`/rooms/${room._id || room.id}`);
    window.scrollTo(0, 0);
  };

  return (
    <div className="flex flex-col md:flex-row items-start py-10 gap-6 border-b border-gray-200 last:pb-30 last:border-0">
      {/* by claude: hover zoom on the photo */}
      <div className="md:w-1/2 overflow-hidden rounded-2xl">
        <img
          onClick={handleRoomClick}
          src={room.images[0]}
          alt="hotel-img"
          title="View Room Details"
          className="max-h-65 w-full object-cover cursor-pointer transition-transform duration-500 hover:scale-105"
        />
      </div>
      <div className="md:w-1/2 flex flex-col gap-2">
        <p className="text-gray-500">{room.hotel.city}</p>
        <p
          onClick={handleRoomClick}
          className="text-gray-800 text-3xl font-playfair cursor-pointer"
        >
          {room.hotel.name}
        </p>
        <div className="flex items-center">
          <StarRating />
          <p className="ml-2">200+ reviews</p>
        </div>
        <div className="flex items-center gap-1 text-gray-500 mt-2 text-sm">
          <MapPin className="h-4 w-4 shrink-0" />
          <span>{room.hotel.address}</span>
        </div>
        <div className="flex flex-wrap items-center mt-3 mb-6 gap-4">
          {room.amenities.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-3 py-2 rounded-full bg-gray-100"
            >
              <FacilityIcon name={item} className="h-4 w-4 text-gray-700" />
              <p className="text-xs">{item}</p>
            </div>
          ))}
        </div>
        <p className="text-xl font-medium text-gray-700">
          {currency}
          {room.pricePerNight}/night
        </p>
      </div>
    </div>
  );
};

export default RoomCard;
