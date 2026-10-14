import { useEffect, useState } from "react";
import Title from "../components/common/Title";
import { MapPin, Users } from "lucide-react"; // by claude
import { useAuth } from "@clerk/clerk-react";
import API from "../lib/axios";
import toast from "react-hot-toast";
import FadeIn from "../components/common/FadeIn"; // by claude
import Pagination from "../components/common/Pagination"; // by claude

const MyBooking = () => {
  const { userId, getToken } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [now] = useState(() => Date.now()); // by claude: "current time" for the cancel rule

  // by claude: bookings come 10 per page from the server, numbered pagination below the list
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const applyPage = (data) => {
    setBookings(data.bookings);
    setPage(data.pagination?.page || 1);
    setTotalPages(data.pagination?.totalPages || 1);
  };

  const goToPage = async (pageToLoad) => {
    try {
      const { data } = await API.get("/api/bookings/user", {
        params: { page: pageToLoad, limit: 10 },
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      if (data.success) {
        applyPage(data);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    const fetchFirstPage = async () => {
      try {
        const { data } = await API.get("/api/bookings/user", {
          params: { page: 1, limit: 10 },
          headers: { Authorization: `Bearer ${await getToken()}` },
        });
        if (data.success) applyPage(data);
        else toast.error(data.message);
      } catch (error) {
        toast.error(error.message);
      }
    };

    if (userId) {
      fetchFirstPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handlePayment = async (bookingId) => {
    try {
      const { data } = await API.post(
        "/api/bookings/stripe-payment",
        { bookingId },
        { headers: { Authorization: `Bearer ${await getToken()}` } },
      );
      if (data.success) {
        window.location.href = data.url;
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  // by claude: a paid booking can be cancelled (with refund) if check-in is > 48h away
  const canCancelPaid = (booking) =>
    booking.status === "CONFIRMED" &&
    new Date(booking.checkInDate).getTime() - now > 48 * 36e5;

  // by claude: cancel a booking (paid ones are refunded by the server)
  const handleCancel = async (bookingId, isPaid = false) => {
    if (!window.confirm(isPaid ? "Cancel this booking? Your payment will be refunded." : "Cancel this booking?")) return;
    try {
      const { data } = await API.patch(
        `/api/bookings/${bookingId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${await getToken()}` } },
      );
      if (data.success) {
        toast.success(data.message);
        setBookings((prev) =>
          prev.map((b) =>
            b.id === bookingId ? { ...b, status: "CANCELLED" } : b,
          ),
        );
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  // by claude: redesigned (minimal cards instead of table)
  const statusStyle = {
    CONFIRMED: { label: "Paid", cls: "bg-green-50 text-green-700" },
    CANCELLED: { label: "Cancelled", cls: "bg-red-50 text-red-600" },
    PENDING: { label: "Pending", cls: "bg-amber-50 text-amber-700" },
  };

  return (
    <div className="py-28 md:pb-35 md:pt-32 px-4 md:px-16 lg:px-24 xl:px-32">
      <Title
        title="My Bookings"
        subTitle="View and manage all your hotel reservations in one place."
        align="left"
      />

      <div className="mt-8 grid max-w-5xl gap-4">
        {bookings.length === 0 && (
          <p className="py-10 text-gray-500">You have no bookings yet.</p>
        )}

        {bookings.map((booking, i) => {
          const st = statusStyle[booking.status] || statusStyle.PENDING;
          return (
            <FadeIn
              key={booking.id}
              delay={i * 0.06}
              className="flex flex-col gap-4 rounded-2xl border border-gray-200 p-4 md:flex-row md:items-center"
            >
              <img
                src={booking.room.images[0]}
                alt="hotel-img"
                className="aspect-4/3 w-full rounded-xl object-cover md:w-48"
              />

              <div className="flex-1 min-w-0">
                <p className="truncate text-lg font-medium text-gray-900">
                  {booking.hotel.name}{" "}
                  <span className="text-sm font-normal text-gray-500">
                    ({booking.room.roomType})
                  </span>
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
                  <MapPin className="h-3.5 w-3.5" />
                  <span className="truncate">{booking.hotel.address}</span>
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
                  <Users className="h-3.5 w-3.5" />
                  Guests: {booking.guests}
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  {new Date(booking.checkInDate).toDateString()} →{" "}
                  {new Date(booking.checkOutDate).toDateString()}
                </p>
                <p className="mt-1 font-semibold text-gray-900">
                  Total: ${booking.totalPrice}
                </p>
              </div>

              <div className="flex flex-col items-start gap-3 md:items-end">
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${st.cls}`}>
                  {st.label}
                </span>
                {/* by claude: paid + free cancellation window -> cancel with refund */}
                {canCancelPaid(booking) && (
                  <button
                    onClick={() => handleCancel(booking.id, true)}
                    className="cursor-pointer rounded-full border border-red-300 px-4 py-1.5 text-xs text-red-600 transition-all hover:bg-red-50"
                  >
                    Cancel &amp; refund
                  </button>
                )}
                {/* by claude: no pay/cancel once the stay is over */}
                {booking.status === "PENDING" &&
                  new Date(booking.checkOutDate) >= new Date() && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePayment(booking.id)}
                        className="cursor-pointer rounded-full bg-gray-900 px-4 py-1.5 text-xs text-white transition-all hover:bg-gray-700"
                      >
                        Pay Now
                      </button>
                      <button
                        onClick={() => handleCancel(booking.id)}
                        className="cursor-pointer rounded-full border border-red-300 px-4 py-1.5 text-xs text-red-600 transition-all hover:bg-red-50"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
              </div>
            </FadeIn>
          );
        })}

        {/* by claude: numbered pagination */}
        <Pagination
          page={page}
          totalPages={totalPages}
          onChange={goToPage}
          className="mt-4"
        />
      </div>
    </div>
  );
};

export default MyBooking;
