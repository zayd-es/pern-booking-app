// by claude: public hotel page (description, gallery, address, available rooms)
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MapPin, Star, ArrowRight } from "lucide-react";
import API from "../lib/axios";
import { useAppStore } from "../store/useAppStore";
import FadeIn from "../components/common/FadeIn";
import Skeleton from "../components/common/Skeleton";
import FacilityIcon from "../components/common/FacilityIcon";

const HotelDetails = () => {
  const { id } = useParams();
  const currency = useAppStore((state) => state.currency);
  const [hotel, setHotel] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | notfound | error
  const [mainImage, setMainImage] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setStatus("loading");
      try {
        const { data } = await API.get(`/api/hotels/${id}`);
        if (cancelled) return;
        setHotel(data.hotel);
        setMainImage(null);
        setStatus("ready");
      } catch (error) {
        if (cancelled) return;
        setStatus(error?.response?.status === 404 ? "notfound" : "error");
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (status === "loading") {
    return (
      <div className="pt-28 md:pt-36 pb-20 px-4 md:px-16 lg:px-24 xl:px-32">
        <Skeleton className="h-9 w-72" />
        <Skeleton className="mt-3 h-4 w-48" />
        <Skeleton className="mt-8 h-[320px] w-full rounded-2xl md:h-[420px]" />
        <Skeleton className="mt-8 h-24 w-full" />
      </div>
    );
  }

  if (status !== "ready") {
    return (
      <div className="pt-36 pb-20 text-center text-gray-500 px-6">
        <p className="text-lg">
          {status === "notfound"
            ? "This hotel doesn't exist or is no longer available."
            : "We couldn't load this hotel. Please try again."}
        </p>
        <Link
          to="/rooms"
          className="mt-5 inline-block rounded-full bg-gray-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-black"
        >
          Browse hotels
        </Link>
      </div>
    );
  }

  const photos = hotel.rooms.flatMap((room) => room.images).filter(Boolean);
  const gallery = [...new Set(photos)].slice(0, 5);
  const cover = mainImage || gallery[0];
  const minPrice = hotel.rooms.length
    ? Math.min(...hotel.rooms.map((r) => r.pricePerNight))
    : null;

  return (
    <div className="pt-28 pb-20 md:pt-36 md:pb-28 px-4 md:px-16 lg:px-24 xl:px-32">
      <FadeIn className="flex flex-col gap-4 border-b border-gray-200 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-gray-900">
            {hotel.name}
          </h1>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
            <MapPin className="h-4 w-4" />
            {hotel.address}, {hotel.city}, {hotel.country}
          </p>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-700">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            4.5
          </p>
        </div>
        {minPrice !== null && (
          <p className="text-gray-500">
            From{" "}
            <span className="text-2xl font-semibold text-gray-900">
              {currency}
              {minPrice}
            </span>{" "}
            / night
          </p>
        )}
      </FadeIn>

      {cover && (
        <FadeIn className="mt-8">
          <img
            src={cover}
            alt={hotel.name}
            className="h-[300px] w-full rounded-2xl object-cover md:h-[440px]"
          />
          {gallery.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-5">
              {gallery.map((image) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setMainImage(image)}
                  className={`overflow-hidden rounded-xl ${
                    cover === image
                      ? "ring-2 ring-gray-900 ring-offset-2"
                      : "opacity-80 hover:opacity-100"
                  } cursor-pointer`}
                >
                  <img
                    src={image}
                    alt=""
                    className="h-16 w-full object-cover sm:h-20"
                  />
                </button>
              ))}
            </div>
          )}
        </FadeIn>
      )}

      {hotel.description && (
        <FadeIn className="mt-10 max-w-3xl">
          <h2 className="text-xl font-semibold text-gray-900">
            About this hotel
          </h2>
          <p className="mt-3 leading-relaxed text-gray-600 whitespace-pre-line">
            {hotel.description}
          </p>
        </FadeIn>
      )}

      <section className="mt-12">
        <FadeIn>
          <h2 className="text-xl font-semibold text-gray-900">
            Available rooms
          </h2>
        </FadeIn>

        {hotel.rooms.length === 0 ? (
          <p className="mt-4 text-gray-500">
            No rooms are available right now.
          </p>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {hotel.rooms.map((room, index) => (
              <FadeIn key={room.id} delay={(index % 3) * 0.08}>
                <Link
                  to={`/rooms/${room.id}`}
                  onClick={() => window.scrollTo(0, 0)}
                  className="group block overflow-hidden rounded-2xl border border-gray-200 transition-shadow hover:shadow-md"
                >
                  <div className="aspect-4/3 overflow-hidden bg-gray-100">
                    <img
                      src={room.images?.[0]}
                      alt={room.roomType}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-gray-900">
                        {room.roomType}
                      </p>
                      <p className="text-sm text-gray-500">
                        <span className="font-semibold text-gray-900">
                          {currency}
                          {room.pricePerNight}
                        </span>{" "}
                        / night
                      </p>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {(room.amenities || []).slice(0, 4).map((item) => (
                        <span
                          key={item}
                          className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700"
                        >
                          <FacilityIcon name={item} className="h-3 w-3" />
                          {item}
                        </span>
                      ))}
                    </div>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-gray-900 transition-all group-hover:gap-2.5">
                      View room <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HotelDetails;
