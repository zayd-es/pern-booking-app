// by claude: new page, edit or delete the hotel of the logged-in owner
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import Title from "@/shared/components/ui/Title";
import { getMyHotel, updateMyHotel, deleteMyHotel } from "@/features/hotels/api";
import { cities } from "@/shared/lib/cities";
import { useAppStore } from "@/store/useAppStore";

const FIELDS = ["name", "contact", "address", "description", "city", "country"]; // by claude: + description

const MyHotel = () => {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const setIsOwner = useAppStore((state) => state.setIsOwner);
  const fetchHotels = useAppStore((state) => state.fetchHotels);

  const [original, setOriginal] = useState(null);
  const [form, setForm] = useState({
    name: "",
    contact: "",
    address: "",
    description: "", // by claude
    city: "",
    country: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const token = await getToken();
        const { data } = await getMyHotel({
          headers: { Authorization: `Bearer ${token}` },
        });
        if (data.success) {
          const values = Object.fromEntries(
            FIELDS.map((key) => [key, data.hotel[key] || ""]),
          );
          setOriginal(values);
          setForm(values);
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to load hotel");
      } finally {
        setLoading(false);
      }
    };
    fetchHotel();
  }, [getToken]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // by claude: send only the fields that changed (PATCH)
  const changedFields = original
    ? Object.fromEntries(
        FIELDS.filter((key) => form[key] !== original[key]).map((key) => [
          key,
          form[key],
        ]),
      )
    : {};
  const hasChanges = Object.keys(changedFields).length > 0;

  const onSaveHandler = async (e) => {
    e.preventDefault();
    if (!hasChanges) return;

    setSaving(true);
    try {
      const token = await getToken();
      const { data } = await updateMyHotel(changedFields, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        toast.success(data.message);
        setOriginal({ ...form });
        await fetchHotels();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update hotel");
    } finally {
      setSaving(false);
    }
  };

  const onDeleteHandler = async () => {
    if (
      !window.confirm(
        "Delete your hotel? All its rooms and old bookings will be removed. This cannot be undone.",
      )
    )
      return;

    setDeleting(true);
    try {
      const token = await getToken();
      const { data } = await deleteMyHotel({
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        toast.success(data.message);
        setIsOwner(false);
        await fetchHotels();
        navigate("/");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete hotel");
    } finally {
      setDeleting(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm font-medium text-gray-900 outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all";
  const labelClass =
    "block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1.5";

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-12 text-gray-500">
        <span className="h-5 w-5 rounded-full border-2 border-gray-900 border-t-transparent animate-spin" />
        <span className="text-sm font-semibold">Loading hotel...</span>
      </div>
    );
  }

  if (!original) {
    return <p className="text-gray-500 py-12">No hotel found.</p>;
  }

  return (
    <div className="max-w-4xl font-sans py-4 px-2">
      <Title
        align="left"
        title="My Hotel"
        subTitle="Update your hotel information. Changes apply to all your rooms."
      />

      <form onSubmit={onSaveHandler} className="mt-6 space-y-6">
        <div className="bg-white border border-gray-300 rounded-xl p-6 shadow-sm space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="name" className={labelClass}>
                Hotel Name
              </label>
              <input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                className={inputClass}
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
                value={form.contact}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>
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
              className={inputClass}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="city" className={labelClass}>
                City
              </label>
              {/* by claude: only Moroccan cities, choosing one also sets the country */}
              <select
                id="city"
                name="city"
                value={form.city}
                onChange={(e) =>
                  setForm({ ...form, city: e.target.value, country: "Morocco" })
                }
                className={inputClass}
                required
              >
                {!cities.includes(form.city) && (
                  <option value={form.city} disabled>
                    {form.city
                      ? `${form.city} (not supported, choose a city)`
                      : "Select City"}
                  </option>
                )}
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
                readOnly
                className={`${inputClass} bg-gray-50 text-gray-500`}
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving || !hasChanges}
          className="px-8 py-3 bg-gray-900 hover:bg-black active:scale-95 text-white text-sm font-semibold rounded-lg transition-all shadow-md disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </form>

      <div className="mt-10 border border-red-200 bg-red-50 rounded-xl p-6">
        <h3 className="text-base font-bold text-red-700">Danger zone</h3>
        <p className="text-sm text-red-600 mt-1 mb-4">
          Deleting your hotel removes all its rooms and past bookings. You
          can&apos;t delete it while there are active bookings.
        </p>
        <button
          type="button"
          onClick={onDeleteHandler}
          disabled={deleting}
          className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-60 cursor-pointer"
        >
          {deleting ? "Deleting..." : "Delete hotel"}
        </button>
      </div>
    </div>
  );
};

export default MyHotel;
