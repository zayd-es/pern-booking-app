// by claude: registration popup redesigned (loading state, esc to close, scroll, clean fields)
import { useEffect, useState } from "react";
import { cities } from "@/shared/lib/cities";
import { X } from "lucide-react"; // by claude
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@clerk/clerk-react";
import { createHotel } from "@/features/hotels/api";
import toast from "react-hot-toast";

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all";
const labelClass = "block text-sm font-medium text-gray-600 mb-1";

const HotelReg = () => {
  const { getToken } = useAuth();
  const setShowHotelReg = useAppStore((state) => state.setShowHotelReg);
  const setIsOwner = useAppStore((state) => state.setIsOwner);

  const [form, setForm] = useState({
    name: "",
    contact: "",
    address: "",
    description: "", // by claude
    city: "",
    country: "Morocco",
  });
  const [loading, setLoading] = useState(false);

  const close = () => setShowHotelReg(false);

  // close with the Escape key and lock the page scroll while the popup is open
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") setShowHotelReg(false);
    };
    window.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [setShowHotelReg]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = await getToken();
      const { data } = await createHotel(form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        toast.success(data.message);
        setIsOwner(true);
        close();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={close}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 overflow-y-auto"
    >
      <form
        onSubmit={onSubmitHandler}
        onClick={(e) => e.stopPropagation()}
        className="relative flex w-full max-w-4xl bg-white rounded-2xl overflow-hidden shadow-2xl my-auto"
      >
        <img
          src="https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=80"
          alt="reg-image"
          className="w-1/2 object-cover hidden md:block"
        />

        <div className="flex flex-col w-full md:w-1/2 p-6 sm:p-8">
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>

          <h2 className="text-2xl font-semibold text-gray-900">
            Register Your Hotel
          </h2>
          <p className="text-sm text-gray-500 mt-1 mb-5">
            Tell us about your hotel to start adding rooms.
          </p>

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className={labelClass}>
                Hotel Name
              </label>
              <input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Riad Atlas"
                className={inputClass}
                minLength={3}
                required
              />
            </div>

            <div>
              <label htmlFor="contact" className={labelClass}>
                Phone
              </label>
              <input
                id="contact"
                name="contact"
                type="tel"
                value={form.contact}
                onChange={handleChange}
                placeholder="e.g. +212 6 12 34 56 78"
                className={inputClass}
                minLength={5}
                required
              />
            </div>

            <div>
              <label htmlFor="address" className={labelClass}>
                Address
              </label>
              <input
                id="address"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Street, number, area"
                className={inputClass}
                minLength={5}
                required
              />
            </div>

            {/* by claude: optional hotel description */}
            <div>
              <label htmlFor="description" className={labelClass}>
                Description <span className="font-normal normal-case text-gray-400">(optional)</span>
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                maxLength={600}
                value={form.description}
                onChange={handleChange}
                placeholder="Tell guests what makes your hotel special"
                className={`${inputClass} resize-none`}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="city" className={labelClass}>
                  City
                </label>
                <select
                  id="city"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  className={inputClass}
                  required
                >
                  <option value="">Select City</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="country" className={labelClass}>
                  Country
                </label>
                <input
                  id="country"
                  name="country"
                  value={form.country}
                  readOnly // by claude: only Morocco for now
                  className={`${inputClass} bg-gray-50 text-gray-500`}
                  minLength={2}
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 transition-all text-white py-2.5 rounded-lg font-medium cursor-pointer"
          >
            {loading && (
              <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            )}
            {loading ? "Registering..." : "Register"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default HotelReg;
