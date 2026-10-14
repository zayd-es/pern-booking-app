import { useState } from "react";
import { ImagePlus } from "lucide-react"; // by claude
import Title from "../../components/common/Title";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import API from "../../lib/axios";
import { useAppStore } from "../../store/useAppStore";
import { useNavigate } from "react-router-dom";

// by claude: minimal restyle (flat cards, no shadows)
const AddRoom = () => {
  const { getToken } = useAuth();
  const fetchRooms = useAppStore((state) => state.fetchRooms);
  const navigate = useNavigate();
  const [images, setImages] = useState({
    1: null,
    2: null,
    3: null,
    4: null,
  });

  const [inputs, setInputs] = useState({
    roomType: "",
    pricePerNight: "",
    description: "",
    amenities: {
      "Free Wifi": false,
      "Free Breakfast": false,
      "Room Service": false,
      "Mountain View": false,
      "Pool Access": false,
    },
  });

  const [loading, setLoading] = useState(false);

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    const hasImages = Object.values(images || {}).some((image) =>
      Boolean(image),
    );
    if (!hasImages) {
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

      const selectedAmenities = Object.keys(inputs.amenities || {}).filter(
        (key) => inputs.amenities[key],
      );
      formData.append("amenities", JSON.stringify(selectedAmenities));

      Object.values(images)
        .filter(Boolean)
        .forEach((image) => formData.append("images", image));

      const { data } = await API.post("/api/rooms", formData, {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });

      if (data.success) {
        toast.success(data.message);
        await fetchRooms();
        navigate("/owner/list-room");
        setInputs({
          roomType: "",
          pricePerNight: "",
          description: "",
          amenities: {
            "Free Wifi": false,
            "Free Breakfast": false,
            "Room Service": false,
            "Mountain View": false,
            "Pool Access": false,
          },
        });
        setImages({ 1: null, 2: null, 3: null, 4: null });
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(error?.response?.data?.message || "Failed to submit form");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl font-sans py-4 px-2">
      <Title
        align="left"
        title="Add New Room"
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
            {Object.keys(images).map((key) => (
              <label
                htmlFor={`roomImage${key}`}
                key={key}
                className="flex flex-col items-center justify-center h-28 rounded-xl border-2 border-dashed border-gray-300 hover:border-gray-900 bg-gray-50 hover:bg-gray-100 transition-all cursor-pointer overflow-hidden"
              >
                {images[key] ? (
                  <img
                    src={URL.createObjectURL(images[key])}
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
                  accept="image/*"
                  id={`roomImage${key}`}
                  hidden
                  onChange={(e) =>
                    setImages({ ...images, [key]: e.target.files[0] })
                  }
                />
              </label>
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

            {/* 🟢 حقل المدخل الجديد الخاص بالمدينة (City) */}

            <div>
              <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1.5">
                Price per Night ($)
              </label>
              <input
                type="number"
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

        {/* Action Button */}
        <div className="flex justify-start">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-gray-900 hover:bg-black active:scale-95 text-white text-sm font-semibold rounded-full transition-all disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading && (
              <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            )}
            {loading ? "Publishing Room..." : "Publish Room"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddRoom;
