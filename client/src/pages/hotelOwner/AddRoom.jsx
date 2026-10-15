import { useEffect, useState } from "react";
import { ImagePlus, X } from "lucide-react"; // by claude
import Title from "../../components/common/Title";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import API from "../../lib/axios";
import { useAppStore } from "../../store/useAppStore";
import { useNavigate, useParams } from "react-router-dom";
import imageCompression from "browser-image-compression"; // by claude

// by claude: this page is now used for BOTH "Add room" and "Edit room" (route /owner/edit-room/:id)
const AMENITIES = [
  "Free WiFi",
  "Free Breakfast",
  "Room Service",
  "Mountain View",
  "Pool Access",
];
const emptyInputs = () => ({
  roomType: "",
  pricePerNight: "",
  description: "",
  amenities: Object.fromEntries(AMENITIES.map((a) => [a, false])),
});
// each slot is null, { url } (already uploaded photo) or { file } (new photo)
const emptySlots = () => [null, null, null, null];

const AddRoom = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { getToken } = useAuth();
  const fetchRooms = useAppStore((state) => state.fetchRooms);
  const navigate = useNavigate();

  const [slots, setSlots] = useState(emptySlots);
  const [inputs, setInputs] = useState(emptyInputs);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(isEdit);

  // edit mode: load the room and fill the form
  useEffect(() => {
    if (!isEdit) return;
    const loadRoom = async () => {
      try {
        const { data } = await API.get("/api/rooms/owner", {
          headers: { Authorization: `Bearer ${await getToken()}` },
        });
        const room = data.rooms?.find((r) => r.id === id);
        if (!room) {
          toast.error("Room not found");
          navigate("/owner/list-room");
          return;
        }
        const owned = (room.amenities || []).map((a) => a.toLowerCase());
        setInputs({
          roomType: room.roomType,
          pricePerNight: String(room.pricePerNight),
          description: room.description || "",
          amenities: Object.fromEntries(
            AMENITIES.map((a) => [a, owned.includes(a.toLowerCase())]),
          ),
        });
        setSlots(
          [0, 1, 2, 3].map((i) =>
            room.images?.[i] ? { url: room.images[i] } : null,
          ),
        );
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to load room");
        navigate("/owner/list-room");
      } finally {
        setPageLoading(false);
      }
    };
    loadRoom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const setSlot = (index, value) =>
    setSlots((prev) => prev.map((s, i) => (i === index ? value : s)));

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!slots.some(Boolean)) {
      toast.error("Please upload at least one room image.");
      return;
    }
    if (!inputs.roomType || Number(inputs.pricePerNight) <= 0) {
      toast.error("Please provide a valid room type, and price per night.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("roomType", inputs.roomType);
      formData.append("pricePerNight", inputs.pricePerNight);
      formData.append("description", inputs.description);

      const selectedAmenities = Object.keys(inputs.amenities).filter(
        (key) => inputs.amenities[key],
      );
      formData.append("amenities", JSON.stringify(selectedAmenities));

      // edit mode: tell the server which existing photos to keep
      if (isEdit) {
        formData.append(
          "keepImages",
          JSON.stringify(slots.filter((s) => s?.url).map((s) => s.url)),
        );
      }

      // by claude: shrink NEW photos in the browser (Vercel rejects request bodies > 4.5MB with a 413)
      const compressed = await Promise.all(
        slots
          .filter((s) => s?.file)
          .map((s) =>
            imageCompression(s.file, {
              maxSizeMB: 0.9,
              maxWidthOrHeight: 1920,
              useWebWorker: true,
            }),
          ),
      );
      compressed.forEach((image, i) =>
        formData.append("images", image, `room-${i}.jpg`),
      );

      const headers = { Authorization: `Bearer ${await getToken()}` };
      const { data } = isEdit
        ? await API.patch(`/api/rooms/${id}`, formData, { headers })
        : await API.post("/api/rooms", formData, { headers });

      if (data.success) {
        toast.success(data.message);
        await fetchRooms();
        navigate("/owner/list-room");
        if (!isEdit) {
          setInputs(emptyInputs());
          setSlots(emptySlots());
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Submission error:", error);
      // by claude: friendly message when the request is still too big
      toast.error(
        error?.response?.status === 413
          ? "Images are too large, please use smaller photos"
          : error?.response?.data?.message || "Failed to submit form",
      );
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-500 gap-2">
        <span className="h-5 w-5 rounded-full border-2 border-gray-900 border-t-transparent animate-spin" />
        <span className="text-sm font-semibold">Loading room...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl font-sans py-4 px-2">
      <Title
        align="left"
        title={isEdit ? "Edit Room" : "Add New Room"}
        subTitle="Provide clear details, accurate pricing, and amenities to elevate your guests' booking experience."
      />

      <form onSubmit={onSubmitHandler} className="mt-6 space-y-6">
        {/* Gallery Upload */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <label className="block text-base font-bold text-gray-900 mb-1">
            Room Gallery
          </label>
          <p className="text-xs text-gray-600 mb-4 font-medium">
            Upload up to 4 photos. First image is the cover.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {slots.map((slot, index) => (
              <div key={index} className="relative">
                <label
                  htmlFor={`roomImage${index}`}
                  className="flex flex-col items-center justify-center h-28 rounded-xl border-2 border-dashed border-gray-300 hover:border-gray-900 bg-gray-50 hover:bg-gray-100 transition-all cursor-pointer overflow-hidden"
                >
                  {slot ? (
                    <img
                      src={slot.url || URL.createObjectURL(slot.file)}
                      alt="Room preview"
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-gray-600">
                      <ImagePlus className="h-6 w-6 opacity-80" />
                      <span className="text-xs font-semibold">Upload Image</span>
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    id={`roomImage${index}`}
                    hidden
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) setSlot(index, { file });
                      e.target.value = "";
                    }}
                  />
                </label>
                {slot && (
                  <button
                    type="button"
                    onClick={() => setSlot(index, null)}
                    aria-label="Remove photo"
                    className="absolute -top-2 -right-2 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-gray-900 text-white shadow"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Basic Info */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
          <h3 className="text-base font-bold text-gray-900 pb-2 border-b border-gray-200">
            Basic Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1.5">
                Room Category
              </label>
              <select
                value={inputs.roomType}
                onChange={(e) =>
                  setInputs({ ...inputs, roomType: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm font-medium text-gray-900 outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all cursor-pointer"
              >
                <option value="">Select Category</option>
                <option value="Single Bed">Single Bed</option>
                <option value="Double Bed">Double Bed</option>
                <option value="Luxury Room">Luxury Room</option>
                <option value="Family Suite">Family Suite</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1.5">
                Price per Night ($)
              </label>
              <input
                type="number"
                min="1"
                step="1" // by claude: whole numbers only
                placeholder="e.g. 150"
                value={inputs.pricePerNight}
                onChange={(e) =>
                  setInputs({ ...inputs, pricePerNight: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1.5">
              Room Description
            </label>
            <textarea
              rows={4}
              placeholder="Highlight unique features, views, bed configurations, or atmosphere..."
              value={inputs.description}
              onChange={(e) =>
                setInputs({ ...inputs, description: e.target.value })
              }
              className="w-full rounded-lg border border-gray-300 bg-white p-3.5 text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Amenities */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <label className="block text-base font-bold text-gray-900 mb-1">
            Included Amenities
          </label>
          <p className="text-xs text-gray-600 mb-4 font-medium">
            Select the services and perks available for this room.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.keys(inputs.amenities).map((amenity) => {
              const checked = inputs.amenities[amenity];
              return (
                <label
                  key={amenity}
                  htmlFor={amenity}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer select-none ${
                    checked
                      ? "border-gray-900 bg-gray-900 text-white font-semibold"
                      : "border-gray-300 bg-gray-50 text-gray-800 hover:border-gray-400 font-medium"
                  }`}
                >
                  <input
                    type="checkbox"
                    id={amenity}
                    checked={checked}
                    onChange={() =>
                      setInputs((prev) => ({
                        ...prev,
                        amenities: {
                          ...prev.amenities,
                          [amenity]: !prev.amenities[amenity],
                        },
                      }))
                    }
                    className="hidden"
                  />
                  <span
                    className={`w-4 h-4 rounded flex items-center justify-center border text-xs font-bold ${
                      checked
                        ? "border-white bg-white text-gray-900"
                        : "border-gray-400 bg-white"
                    }`}
                  >
                    {checked && "✓"}
                  </span>
                  <span className="text-xs">{amenity}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-gray-900 hover:bg-black active:scale-95 text-white text-sm font-semibold rounded-full transition-all disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading && (
              <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            )}
            {isEdit
              ? loading
                ? "Saving..."
                : "Save Changes"
              : loading
                ? "Publishing Room..."
                : "Publish Room"}
          </button>
          {isEdit && (
            <button
              type="button"
              onClick={() => navigate("/owner/list-room")}
              className="px-6 py-3 rounded-full border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AddRoom;
