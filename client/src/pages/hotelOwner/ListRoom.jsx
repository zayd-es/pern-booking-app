import { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // by claude
import { Pencil } from "lucide-react"; // by claude
import Title from "../../components/common/Title";
import API from "../../lib/axios";
import { useAuth, useUser } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import { useAppStore } from "../../store/useAppStore";

// by claude: minimal restyle (rounded table, neutral toggle)
const ListRoom = () => {
  const [rooms, setRooms] = useState([]);

  // 🟢 State بسيطة وعادية ديال Loading
  const [loading, setLoading] = useState(true);

  const { getToken } = useAuth();
  const { user } = useUser();
  const currency = useAppStore((state) => state.currency);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const token = await getToken();

        const { data } = await API.get("/api/rooms/owner", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (data.success) {
          setRooms(data.rooms);
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        console.error("Fetch rooms error:", error);
        toast.error(error?.response?.data?.message || "Failed to fetch rooms");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchRooms();
    }
  }, [user, getToken]);

  const toggleAvailability = async (roomId) => {
    try {
      const token = await getToken();
      const { data } = await API.post(
        "/api/rooms/toggle-availability",
        { roomId },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (data.success) {
        toast.success(data.message);
        setRooms((prevRooms) =>
          prevRooms.map((room) =>
            room.id === roomId
              ? { ...room, isAvailable: !room.isAvailable }
              : room,
          ),
        );
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Toggle availability error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to change availability",
      );
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm("Are you sure you want to delete this room?")) return;

    try {
      const token = await getToken();
      const { data } = await API.delete(`/api/rooms/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        toast.success(data.message || "Room deleted successfully");
        setRooms((prevRooms) => prevRooms.filter((room) => room.id !== roomId));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Delete room error:", error);
      toast.error(error?.response?.data?.message || "Failed to delete room");
    }
  };

  return (
    <div>
      <Title
        align="left"
        font="outfit"
        title="Room Listings"
        subTitle="View, edit, or manage all listed rooms. Keep the information up-to-date to provide the best experience for users."
      />

      <p className="text-gray-500 mt-8">All Rooms</p>

      <div className="w-full max-w-4xl text-left border border-gray-200 rounded-2xl max-h-96 overflow-y-auto overflow-x-hidden mt-3">
        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="py-3 px-2 sm:px-4 text-sm sm:text-base text-gray-800 font-medium">
                Room
              </th>
              <th className="py-3 px-4 text-gray-800 font-medium max-sm:hidden">
                Amenities
              </th>
              <th className="py-3 px-4 text-gray-800 font-medium max-sm:hidden">
                Price / Night
              </th>
              <th className="py-3 px-2 sm:px-4 text-sm sm:text-base text-gray-800 font-medium text-center">
                Availability
              </th>
              <th className="py-3 px-2 sm:px-4 text-sm sm:text-base text-gray-800 font-medium text-center">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {/* 🟢 Loading عادية وأنيقة وقت جلب الرومات */}
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-12 text-gray-500">
                  <div className="flex items-center justify-center gap-2">
                    <span className="h-5 w-5 rounded-full border-2 border-gray-900 border-t-transparent animate-spin" />
                    <span className="text-sm font-semibold">
                      Loading rooms...
                    </span>
                  </div>
                </td>
              </tr>
            ) : rooms.length > 0 ? (
              rooms.map((room) => (
                <tr key={room.id}>
                  {/* Room: image + type + city (+ price على الموبايل) */}
                  <td className="py-3 px-2 sm:px-4 text-gray-700 border-t border-gray-200">
                    <div className="flex items-center gap-2 sm:gap-3">
                      {room.images?.[0] ? (
                        <img
                          src={room.images[0]}
                          alt={room.roomType}
                          className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg bg-gray-100 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm sm:text-base font-medium text-gray-900 leading-tight">
                          {room.roomType}
                        </p>
                        <p className="text-xs text-gray-500">
                          {room.hotel?.city || "—"}
                        </p>
                        <p className="sm:hidden text-xs font-bold text-gray-900">
                          {currency}
                          {room.pricePerNight}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-gray-700 border-t border-gray-200 max-sm:hidden text-sm">
                    {Array.isArray(room.amenities)
                      ? room.amenities.join(", ")
                      : room.amenities}
                  </td>

                  <td className="py-3 px-4 text-gray-700 border-t border-gray-200 font-bold whitespace-nowrap max-sm:hidden">
                    {currency}
                    {room.pricePerNight}
                  </td>

                  <td className="py-3 px-2 sm:px-4 border-t border-gray-200 text-center">
                    <label className="relative inline-flex items-center cursor-pointer text-gray-900 gap-3">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={room.isAvailable}
                        onChange={() => toggleAvailability(room.id)}
                      />
                      <div className="w-12 h-7 bg-slate-300 rounded-full peer peer-checked:bg-gray-900 transition-colors duration-200"></div>
                      <span className="dot absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5"></span>
                    </label>
                  </td>

                  <td className="py-3 px-2 sm:px-4 border-t border-gray-200 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {/* by claude: edit button */}
                      <Link
                        to={`/owner/edit-room/${room.id}`}
                        className="inline-flex items-center gap-1 text-gray-800 hover:text-black text-xs font-bold px-2.5 sm:px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                      >
                        <Pencil className="h-3 w-3" />
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteRoom(room.id)}
                        className="text-red-600 hover:text-red-800 text-xs font-bold px-2.5 sm:px-3 py-1.5 rounded-full bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="text-center py-8 text-gray-500 border-t font-medium"
                >
                  No rooms added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListRoom;
