// by claude: search bar redesigned (pill style); also skips the "recent search" call when logged out
import { useState } from "react";
import { cities } from "@/shared/lib/cities";
import { MapPin, Calendar, Users, Search } from "lucide-react"; // by claude
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { storeRecentSearch } from "@/features/users/api";

const fieldClass = "flex-1 min-w-0 px-5 py-3 cursor-text";
const labelClass =
  "flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-500";
const inputClass =
  "w-full bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none mt-1";

export const SearchForm = () => {
  const setSearchedCities = useAppStore((state) => state.setSearchedCities);
  const searchedCities = useAppStore((state) => state.searchedCities); // by claude
  const { getToken, isSignedIn } = useAuth();
  const navigate = useNavigate();
  const [destination, setDestination] = useState("");
  const [showCities, setShowCities] = useState(false); // by claude
  // by claude: cities that contain what the user typed (all cities when empty)
  const matchingCities = cities.filter((city) =>
    city.toLowerCase().includes(destination.trim().toLowerCase()),
  );

  const onSearch = async (e) => {
    e.preventDefault();
    navigate(`/rooms?destination=${encodeURIComponent(destination)}`);

    // by claude: only logged-in users have recent searches
    if (!isSignedIn) return;

    try {
      await storeRecentSearch({ recentSearchedCity: destination },
        { headers: { Authorization: `Bearer ${await getToken()}` } },
      );
      // by claude: the store setter takes an array, not an updater function
      // by claude: same as the server: newest first, max 4 cities
      const updated = [
        destination,
        ...searchedCities.filter(
          (city) => city.toLowerCase() !== destination.toLowerCase(),
        ),
      ].slice(0, 4);
      setSearchedCities(updated);
    } catch (error) {
      console.error("Failed to store recent search:", error);
    }
  };

  return (
    <form
      onSubmit={onSearch}
      className="w-full max-w-5xl bg-white rounded-3xl lg:rounded-full border border-gray-200 shadow-xl shadow-gray-200/70 p-2 flex flex-col lg:flex-row lg:items-center divide-y lg:divide-y-0 lg:divide-x divide-gray-200"
    >
      {/* by claude: custom dropdown instead of <datalist> (datalist does not open on most phones) */}
      <div className="relative flex-1 min-w-0">
        <label htmlFor="destinationInput" className={`${fieldClass} block`}>
          <span className={labelClass}>
            <MapPin className="h-3.5 w-3.5" />
            Destination
          </span>
          <input
            id="destinationInput"
            type="text"
            value={destination}
            onChange={(e) => {
              setDestination(e.target.value);
              setShowCities(true);
            }}
            onFocus={() => setShowCities(true)}
            onBlur={() => setShowCities(false)}
            onKeyDown={(e) => e.key === "Escape" && setShowCities(false)}
            className={inputClass}
            placeholder="Where are you going?"
            autoComplete="off"
            required
          />
        </label>
        {showCities && matchingCities.length > 0 && (
          <ul className="absolute left-0 right-0 top-full z-30 mt-2 max-h-60 overflow-y-auto rounded-2xl border border-gray-200 bg-white p-1.5 shadow-xl shadow-gray-200/70">
            {matchingCities.map((city) => (
              <li key={city}>
                {/* onMouseDown (not onClick) so the input keeps focus until a city is picked; works for touch too */}
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setDestination(city);
                    setShowCities(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-gray-900 hover:bg-gray-100 cursor-pointer"
                >
                  <MapPin className="h-4 w-4 text-gray-400" />
                  {city}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <label htmlFor="checkIn" className={fieldClass}>
        <span className={labelClass}>
          <Calendar className="h-3.5 w-3.5" />
          Check in
        </span>
        <input id="checkIn" type="date" className={inputClass} />
      </label>

      <label htmlFor="checkOut" className={fieldClass}>
        <span className={labelClass}>
          <Calendar className="h-3.5 w-3.5" />
          Check out
        </span>
        <input id="checkOut" type="date" className={inputClass} />
      </label>

      <label htmlFor="guests" className={`${fieldClass} lg:max-w-32`}>
        <span className={labelClass}>
          <Users className="h-3.5 w-3.5" />
          Guests
        </span>
        <input
          min={1}
          max={4}
          id="guests"
          type="number"
          className={inputClass}
          placeholder="Add"
        />
      </label>

      <button className="mt-2 lg:mt-0 lg:ml-2 flex items-center justify-center gap-2 rounded-full bg-gray-900 hover:bg-black active:scale-95 transition-all py-3.5 px-7 text-white text-sm font-medium cursor-pointer">
        <Search className="h-5 w-5" />
        <span>Search</span>
      </button>
    </form>
  );
};
