import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MapPin, User } from "lucide-react"; // by claude
import FacilityIcon from "../components/common/FacilityIcon"; // by claude
import StarRating from "../components/common/StarRating";
import { useAppStore } from "../store/useAppStore";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import API from "../lib/axios";
import FadeIn from "../components/common/FadeIn"; // by claude

const RoomDetails = () => {
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isAvailable, setIsAvailable] = useState(null);
  const [guest, setGuest] = useState(1);

  const { id } = useParams();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const rooms = useAppStore((state) => state.rooms);

  const room = rooms.find((item) => item.id === id);

  if (!room) {
    return (
      <div className="pt-36 text-center text-gray-500 font-inter text-lg">
        Room not found or no longer available.
      </div>
    );
  }

  const checkAvailability = async () => {
    try {
      if (checkInDate >= checkOutDate) {
        return toast.error("Check-In Date should be less than Check-Out Date");
      }

      const { data } = await API.post(
        "/api/bookings/check-availability",
        {
          roomId: id,
          checkInDate,
          checkOutDate,
        },
        { headers: { Authorization: `Bearer ${await getToken()}` } },
      );

      if (data.success) {
        if (data.isAvailable) {
          setIsAvailable(true);
          toast.success("Room is available for your dates!");
        } else {
          setIsAvailable(false);
          toast.error("Room is already booked for these dates.");
        }
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      if (!isAvailable) {
        return checkAvailability();
      } else {
        const { data } = await API.post(
          "/api/bookings/book",
          {
            roomId: id,
            checkInDate,
            checkOutDate,
            guests: guest,
            paymentMethod: "Pay At Hotel",
          },
          { headers: { Authorization: `Bearer ${await getToken()}` } },
        );

        if (data.success) {
          toast.success(data.message);
          navigate("/my-bookings");
          window.scrollTo(0, 0);
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const mainImage = selectedImage || room.images[0];

  return (
    room && (
      <div className="pt-28 pb-20 md:pt-36 md:pb-32 px-4 md:px-16 lg:px-24 xl:px-32 bg-white min-h-screen">
        {/* by claude: minimal restyle (flat cards, no heavy shadows) */}
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-playfair font-semibold text-gray-900">
                {room.hotel.name}
              </h1>
              <span className="text-xs font-inter font-medium py-1 px-3 bg-primary/10 text-primary rounded-full border border-primary/20">
                {room.roomType}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-500 mt-2 text-sm font-inter">
              <MapPin className="h-4 w-4 opacity-70" />
              <span>
                {room.hotel.address}, {room.hotel.city},{" "}
                {room.hotel.country || "Morocco"}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-playfair font-bold text-gray-900">
              ${room.pricePerNight}
              <span className="text-sm font-inter font-normal text-gray-500">
                {" "}
                / night
              </span>
            </p>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <img
              src={mainImage}
              alt="Main Room View"
              className="w-full h-[380px] md:h-[480px] rounded-2xl object-cover transition-all duration-300"
            />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
            {room?.images?.slice(1, 3).map((image, index) => (
              <img
                onClick={() => setSelectedImage(image)}
                key={index}
                src={image}
                alt="Room Thumbnail"
                className={`w-full h-[180px] md:h-[230px] rounded-2xl object-cover cursor-pointer transition-all duration-200 ${
                  mainImage === image
                    ? "ring-2 ring-primary ring-offset-2"
                    : "opacity-80 hover:opacity-100"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Main Content & Booking Bar Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-12 items-start">
          {/* Left Side: Dynamic Details & Amenities */}
          <FadeIn className="lg:col-span-2 space-y-10">
            {/* Highlights / Features */}
            <div className="bg-white p-0 space-y-6">
              <h2 className="text-2xl font-playfair font-semibold text-gray-900">
                A Sophisticated Stay Experience
              </h2>
              {/* by claude: real hotel description when the owner wrote one */}
              {room.hotel.description ? (
                <p className="text-gray-600 font-inter leading-relaxed text-sm md:text-base whitespace-pre-line">
                  {room.hotel.description}
                </p>
              ) : (
              <p className="text-gray-600 font-inter leading-relaxed text-sm md:text-base">
                Immerse yourself in comfort at {room.hotel.name}. Designed with
                a clean, modern aesthetic, this{" "}
                <span className="font-semibold text-gray-800">
                  {room.roomType}
                </span>{" "}
                offers a tranquil atmosphere tailored for relaxation and
                productivity alike, situated right in the vibrant heart of{" "}
                {room.hotel.city}.
              </p>
              )}

              {/* Dynamic Amenities */}
              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-lg font-playfair font-medium text-gray-800 mb-4">
                  Room Amenities & Features
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {room.amenities.map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 text-gray-700"
                    >
                      <FacilityIcon name={item} className="h-5 w-5" />
                      <span className="text-xs font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Host Profile Info */}
            <div className="border-t border-gray-200 pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                {room.hotel.owner?.image ? (
                  <img
                    src={room.hotel.owner.image}
                    alt="Host"
                    className="h-16 w-16 rounded-full object-cover border-2 border-primary/20"
                  />
                ) : (
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                    <User className="h-7 w-7" />
                  </span>
                )}
                <div>
                  <p className="text-lg font-playfair font-semibold text-gray-900">
                    Hosted by {room.hotel.name} Management
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {/* by claude: real rating from the reviews */}
                    {room.hotel.rating?.count ? (
                      <>
                        <StarRating rating={Math.round(room.hotel.rating.average)} />
                        <span className="text-xs font-inter text-gray-500">
                          {room.hotel.rating.average.toFixed(1)} ({room.hotel.rating.count} reviews)
                        </span>
                      </>
                    ) : (
                      <span className="text-xs font-inter text-gray-500">
                        No reviews yet
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => toast("Direct messaging feature coming soon!")}
                className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-inter text-sm hover:bg-gray-50 transition-all cursor-pointer"
              >
                Contact Host
              </button>
            </div>
          </FadeIn>

          {/* Right Side: Booking Card Sticky Form */}
          <FadeIn delay={0.15} className="lg:col-span-1 sticky top-28">
            <form
              onSubmit={onSubmitHandler}
              className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 space-y-5"
            >
              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <span className="text-2xl font-playfair font-bold text-gray-900">
                  ${room.pricePerNight}
                </span>
                <span className="text-xs text-gray-500 font-inter">
                  Per Night
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="checkInDate"
                    className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5"
                  >
                    Check-In Date
                  </label>
                  <input
                    type="date"
                    value={checkInDate || ""}
                    onChange={(e) => {
                      setCheckInDate(e.target.value);
                      setIsAvailable(false);
                    }}
                    min={new Date().toISOString().split("T")[0]}
                    id="checkInDate"
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-primary transition-all bg-gray-50/50"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="checkOutDate"
                    className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5"
                  >
                    Check-Out Date
                  </label>
                  <input
                    type="date"
                    id="checkOutDate"
                    value={checkOutDate || ""}
                    min={checkInDate}
                    disabled={!checkInDate}
                    onChange={(e) => {
                      setCheckOutDate(e.target.value);
                      setIsAvailable(false);
                    }}
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-primary transition-all bg-gray-50/50 disabled:opacity-50"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="guests"
                    className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5"
                  >
                    Guests
                  </label>
                  <input
                    type="number"
                    id="guests"
                    value={guest}
                    onChange={(e) => setGuest(e.target.value)}
                    min="1"
                    max="10"
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-primary transition-all bg-gray-50/50"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-dull active:scale-[0.98] transition-all text-white font-medium rounded-xl py-3.5 text-sm cursor-pointer mt-2"
              >
                {isAvailable ? "Proceed to Book" : "Check Availability"}
              </button>
            </form>
          </FadeIn>
        </div>
      </div>
    )
  );
};

export default RoomDetails;
