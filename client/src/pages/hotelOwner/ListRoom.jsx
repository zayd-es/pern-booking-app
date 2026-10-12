import { useEffect, useState } from "react";
import Title from "../../components/common/Title";
import API from "../../lib/axios";
import { useAuth, useUser } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import { useAppStore } from "../../store/useAppStore";

const ListRoom = () => {
  const [rooms, setRooms] = useState([]);
  const { getToken } = useAuth();
  const { user } = useUser();
  const currency = useAppStore((state) => state.currency);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
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

  return (
    <div>
      <Title
        align="left"
        font="outfit"
        title="Room Listings"
        subTitle="View, edit, or manage all listed rooms. Keep the information up-to-date to provide the best experience for users."
      />

      <p className="text-gray-500 mt-8">All Rooms</p>

      <div className="w-full max-w-3xl text-left border border-gray-300 rounded-lg max-h-80 overflow-y-scroll mt-3">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {/* العناوين المتقادة صحيحة */}
              <th className="py-3 px-4 text-gray-800 font-medium">Room Type</th>
              <th className="py-3 px-4 text-gray-800 font-medium max-sm:hidden">
                Amenities
              </th>
              <th className="py-3 px-4 text-gray-800 font-medium">
                Price / Night
              </th>
              <th className="py-3 px-4 text-gray-800 font-medium text-center">
                Availability
              </th>
            </tr>
          </thead>
          <tbody>
            {rooms.length > 0 ? (
              rooms.map((room) => (
                <tr key={room.id}>
                  <td className="py-3 px-4 text-gray-700 border-t border-gray-300">
                    {room.roomType}
                  </td>

                  <td className="py-3 px-4 text-gray-700 border-t border-gray-300 max-sm:hidden">
                    {Array.isArray(room.amenities)
                      ? room.amenities.join(", ")
                      : room.amenities}
                  </td>

                  <td className="py-3 px-4 text-gray-700 border-t border-gray-300">
                    {currency}
                    {room.pricePerNight}
                  </td>

                  <td className="py-3 px-4 border-t border-gray-300 text-center">
                    <label className="relative inline-flex items-center cursor-pointer text-gray-900 gap-3">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={room.isAvailable}
                        onChange={() => {
                          toggleAvailability(room.id);
                        }}
                      />
                      <div className="w-12 h-7 bg-slate-300 rounded-full peer peer-checked:bg-blue-600 transition-colors duration-200"></div>
                      <span className="dot absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5"></span>
                    </label>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="text-center py-6 text-gray-500 border-t"
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
