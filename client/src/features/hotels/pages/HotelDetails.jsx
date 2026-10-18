// by claude: public hotel page (description, gallery, address, available rooms)
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MapPin, ArrowRight } from "lucide-react";
import API from "../lib/axios";
import { useAuth } from "@clerk/clerk-react"; // by claude
import toast from "react-hot-toast"; // by claude
import ReviewModal from "../components/common/ReviewModal"; // by claude
import { useAppStore } from "../store/useAppStore";
import FadeIn from "../components/common/FadeIn";
import Skeleton from "../components/common/Skeleton";
import FacilityIcon from "../components/common/FacilityIcon";
import RatingBadge from "../components/common/RatingBadge"; // by claude
import StarRating from "../components/common/StarRating"; // by claude
import Pagination from "../components/common/Pagination"; // by claude

const HotelDetails = () => {
  const { id } = useParams();
  const currency = useAppStore((state) => state.currency);
  const [hotel, setHotel] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | notfound | error
  const [mainImage, setMainImage] = useState(null);

  // by claude: reviews (5 per page)
  const [reviews, setReviews] = useState([]);
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewPages, setReviewPages] = useState(1);
  const { isSignedIn, getToken } = useAuth(); // by claude
  const [canReply, setCanReply] = useState(false); // by claude: viewer owns this hotel
  const [editing, setEditing] = useState(null); // by claude: my review being edited
  const [replyingId, setReplyingId] = useState(null); // by claude
  const [replyText, setReplyText] = useState(""); // by claude

  // by claude: owner publishes (or removes, with empty text) the answer to a review
  const saveReply = async (reviewId) => {
    try {
      const { data } = await API.patch(
        `/api/reviews/${reviewId}/reply`,
        { reply: replyText },
        { headers: { Authorization: `Bearer ${await getToken()}` } },
      );
      if (data.success) {
        toast.success(data.message);
        setReviews((prev) =>
          prev.map((r) => (r.id === reviewId ? { ...r, ...data.review } : r)),
        );
        setReplyingId(null);
      } else toast.error(data.message);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to save the reply");
    }
  };

  useEffect(() => {
    let cancelled = false;
    const loadReviews = async () => {
      try {
        const token = isSignedIn ? await getToken() : null; // by claude: optional, for isMine / canReply
        const { data } = await API.get(`/api/reviews/hotel/${id}`, {
          params: { page: reviewPage, limit: 5 },
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (cancelled || !data.success) return;
        setCanReply(!!data.canReply);
        setReviews(data.reviews);
        setReviewPages(data.pagination.totalPages || 1);
      } catch {
        if (!cancelled) setReviews([]);
      }
    };
    loadReviews();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, reviewPage, isSignedIn]);

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
          <div className="mt-2">
            <RatingBadge rating={hotel.rating} />
          </div>
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

      <section className="mt-12 max-w-3xl">
        <FadeIn>
          <h2 className="text-xl font-semibold text-gray-900">
            Guest reviews
            {hotel.rating?.count > 0 && (
              <span className="ml-2 text-base font-normal text-gray-500">
                {hotel.rating.average.toFixed(1)} / 5 · {hotel.rating.count}{" "}
                review{hotel.rating.count === 1 ? "" : "s"}
              </span>
            )}
          </h2>
        </FadeIn>

        {reviews.length === 0 ? (
          <p className="mt-4 text-gray-500">
            No reviews yet. Guests can review this hotel after their stay.
          </p>
        ) : (
          <div className="mt-5 divide-y divide-gray-200">
            {reviews.map((review) => (
              <div key={review.id} className="flex gap-4 py-5">
                {review.user?.image ? (
                  <img
                    src={review.user.image}
                    alt=""
                    className="h-11 w-11 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                    {(review.user?.username || "G")[0].toUpperCase()}
                  </span>
                )}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <p className="font-medium text-gray-900">
                      {review.user?.username || "Guest"}
                    </p>
                    <StarRating rating={review.rating} />
                    <span className="text-xs text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString()}
                      {review.editedAt && " (edited)"}
                    </span>
                    {review.isMine && (
                      <button
                        onClick={() => setEditing(review)}
                        className="cursor-pointer text-xs text-gray-500 underline"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                  {review.comment && (
                    <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-gray-600">
                      {review.comment}
                    </p>
                  )}
                  {/* by claude: answer of the hotel */}
                  {review.ownerReply && replyingId !== review.id && (
                    <div className="mt-3 rounded-xl bg-gray-50 p-3 text-sm">
                      <p className="font-medium text-gray-900">Response from the hotel</p>
                      <p className="mt-1 whitespace-pre-line text-gray-600">{review.ownerReply}</p>
                    </div>
                  )}
                  {canReply && replyingId !== review.id && (
                    <button
                      onClick={() => {
                        setReplyingId(review.id);
                        setReplyText(review.ownerReply || "");
                      }}
                      className="mt-2 cursor-pointer text-xs text-gray-500 underline"
                    >
                      {review.ownerReply ? "Edit reply" : "Reply"}
                    </button>
                  )}
                  {replyingId === review.id && (
                    <div className="mt-3">
                      <textarea
                        rows={3}
                        maxLength={500}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a public reply (leave empty to remove it)"
                        className="w-full resize-none rounded-xl border border-gray-300 p-3 text-sm outline-none focus:border-gray-900"
                      />
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() => saveReply(review.id)}
                          className="cursor-pointer rounded-full bg-gray-900 px-4 py-1.5 text-xs text-white hover:bg-black"
                        >
                          Save reply
                        </button>
                        <button
                          onClick={() => setReplyingId(null)}
                          className="cursor-pointer rounded-full border border-gray-300 px-4 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <Pagination
          page={reviewPage}
          totalPages={reviewPages}
          onChange={setReviewPage}
          className="mt-4"
        />
      </section>

      {/* by claude: edit my own review */}
      {editing && (
        <ReviewModal
          review={editing}
          hotelName={hotel.name}
          onClose={() => setEditing(null)}
          onDone={(reviewId, updated) =>
            setReviews((prev) =>
              prev.map((r) => (r.id === reviewId ? { ...r, ...updated } : r)),
            )
          }
        />
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
