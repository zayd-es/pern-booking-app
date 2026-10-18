import { useEffect, useState } from "react";
import { CalendarCheck, Wallet, TrendingUp } from "lucide-react"; // by claude
import Title from "../../components/common/Title";
import { useAppStore } from "../../store/useAppStore";
import { useAuth, useUser } from "@clerk/clerk-react";
import API from "../../lib/axios";
import toast from "react-hot-toast";
import Pagination from "../../components/common/Pagination"; // by claude

// by claude: minimal restyle (neutral stat cards, rounded table)
const Dashboard = () => {
  const currency = useAppStore((state) => state.currency);

  const { getToken } = useAuth();
  const { isLoaded, user } = useUser();
  const [dashboardData, setDashboardData] = useState({
    bookings: [],
    totalBookings: 0,
    confirmedBookings: 0,
    confirmedRevenue: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  // by claude: bookings table is paginated (10 per page), stats come from the server for ALL bookings
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageLoading, setPageLoading] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = await getToken();
        const { data } = await API.get("/api/bookings/hotel", {
          params: { page: 1, limit: 10 },
          headers: { Authorization: `Bearer ${token}` },
        });
        if (data.success) {
          setDashboardData(data.dashboardData);
          setPage(data.dashboardData.pagination?.page || 1);
          setTotalPages(data.dashboardData.pagination?.totalPages || 1);
        } else toast.error(data.message || "Failed to load dashboard data");
      } catch (error) {
        console.error("Dashboard fetch error:", error);
        toast.error(
          error?.response?.data?.message || "Error fetching dashboard data",
        );
      } finally {
        setLoading(false);
      }
    };
    if (isLoaded && user) {
      fetchDashboardData();
    }
  }, [isLoaded, user, getToken]);

  // by claude: open another page of bookings (the stats are refreshed too)
  const goToPage = async (pageToLoad) => {
    setPageLoading(true);
    try {
      const { data } = await API.get("/api/bookings/hotel", {
        params: { page: pageToLoad, limit: 10 },
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      if (data.success) {
        setDashboardData(data.dashboardData);
        setPage(data.dashboardData.pagination?.page || pageToLoad);
        setTotalPages(data.dashboardData.pagination?.totalPages || 1);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load bookings");
    } finally {
      setPageLoading(false);
    }
  };

  // by claude: cancel a booking and update the stats locally
  const handleCancel = async (booking) => {
    // by claude: the server refunds paid Stripe bookings automatically
    const paid = booking.status === "CONFIRMED";
    if (
      !window.confirm(
        paid
          ? "Cancel this booking? The guest will be refunded automatically."
          : "Cancel this booking?",
      )
    )
      return;
    try {
      const token = await getToken();
      const { data } = await API.patch(
        `/api/bookings/${booking.id}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (data.success) {
        toast.success(data.message);
        const wasConfirmed = booking.status === "CONFIRMED";
        setDashboardData((prev) => ({
          ...prev,
          bookings: prev.bookings.map((b) =>
            b.id === booking.id ? { ...b, status: "CANCELLED" } : b,
          ),
          totalRevenue: prev.totalRevenue - booking.totalPrice,
          confirmedBookings: prev.confirmedBookings - (wasConfirmed ? 1 : 0),
          confirmedRevenue:
            prev.confirmedRevenue - (wasConfirmed ? booking.totalPrice : 0),
        }));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to cancel booking");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-500 gap-2">
        <span className="h-5 w-5 rounded-full border-2 border-gray-900 border-t-transparent animate-spin" />
        <span className="text-sm font-semibold">Loading dashboard data...</span>
      </div>
    );
  }

  return (
    <div>
      <Title
        align="left"
        font="outfit"
        title="Dashboard"
        subTitle="Monitor your room listings, track bookings and analyze revenue–all in one place."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8">
        {/* ----- Box 1: Total Bookings ----- */}
        <div className="border border-gray-200 rounded-2xl flex p-5 items-center">
          <CalendarCheck className="max-sm:hidden h-9 w-9 text-gray-400" />
          <div className="flex flex-col sm:ml-4 font-medium">
            <p className="text-gray-500 text-sm">Total Bookings</p>
            <p className="text-neutral-700 text-xl font-bold">
              {dashboardData?.totalBookings || 0}
            </p>
          </div>
        </div>

        {/* ----- Box 2: Confirmed / Paid Only (Length + Revenue) ----- */}
        <div className="border border-gray-200 rounded-2xl flex p-5 items-center">
          <Wallet className="max-sm:hidden h-9 w-9 text-gray-400" />
          <div className="flex flex-col sm:ml-4 font-medium">
            <p className="text-gray-500 text-sm">Paid / Confirmed</p>
            <p className="text-neutral-900 text-xl font-bold">
              {currency} {dashboardData?.confirmedRevenue || 0}
            </p>
            <span className="text-xs font-semibold text-green-600 mt-0.5">
              {dashboardData?.confirmedBookings || 0} Confirmed Bookings
            </span>
          </div>
        </div>

        {/* ----- Box 3: Total Potential Revenue ----- */}
        <div className="border border-gray-200 rounded-2xl flex p-5 items-center">
          <TrendingUp className="max-sm:hidden h-9 w-9 text-gray-400" />
          <div className="flex flex-col sm:ml-4 font-medium">
            <p className="text-gray-500 text-sm">Total Potential Revenue</p>
            <p className="text-neutral-700 text-xl font-bold">
              {currency} {dashboardData?.totalRevenue || 0}
            </p>
          </div>
        </div>
      </div>

      {/* ------ Recent Bookings Table ------- */}
      <div>
        <h2 className="text-xl text-gray-900 font-medium mb-5">
          Recent Bookings
        </h2>

        <div className={`w-full max-w-4xl text-left border border-gray-200 rounded-2xl max-h-80 overflow-y-auto transition-opacity ${pageLoading ? "opacity-50" : ""}`}>
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="py-3 px-4 text-gray-800 font-medium">
                  User Name
                </th>
                <th className="py-3 px-4 text-gray-800 font-medium max-sm:hidden">
                  Room Name
                </th>
                <th className="py-3 px-4 text-gray-800 font-medium text-center">
                  Total Amount
                </th>
                <th className="py-3 px-4 text-gray-800 font-medium text-center">
                  Payment Status
                </th>
                {/* by claude */}
                <th className="py-3 px-4 text-gray-800 font-medium text-center">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {dashboardData?.bookings?.length > 0 ? (
                dashboardData.bookings.map((item, index) => {
                  const statusUpper = String(item.status || "").toUpperCase();
                  const isConfirmed =
                    statusUpper === "CONFIRMED" || statusUpper === "PAID";

                  return (
                    <tr key={item.id || index}>
                      <td className="py-3 px-4 text-gray-700 border-t border-gray-200 font-medium">
                        {item.user?.username || "Guest User"}
                      </td>
                      <td className="py-3 px-4 text-gray-700 border-t border-gray-200 max-sm:hidden">
                        {item.room?.roomType || "N/A"}
                      </td>
                      <td className="py-3 px-4 text-gray-700 border-t border-gray-200 text-center font-bold">
                        {currency} {item.totalPrice}
                      </td>
                      <td className="py-3 px-4 border-t border-gray-200 text-center">
                        <span
                          className={`inline-block py-1 px-3 text-xs font-semibold rounded-full ${
                            isConfirmed
                              ? "bg-green-100 text-green-700"
                              : statusUpper === "PENDING"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      {/* by claude */}
                      <td className="py-3 px-4 border-t border-gray-200 text-center">
                        {statusUpper !== "CANCELLED" &&
                        new Date(item.checkOutDate) >= new Date() ? (
                          <button
                            onClick={() => handleCancel(item)}
                            className="text-red-600 hover:text-red-800 text-xs font-bold px-3 py-1.5 rounded bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center py-8 text-gray-500 border-t font-medium"
                  >
                    No bookings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* by claude: numbered pagination */}
        <Pagination
          page={page}
          totalPages={totalPages}
          onChange={goToPage}
          className="mt-5 max-w-4xl"
        />
      </div>
    </div>
  );
};

export default Dashboard;
