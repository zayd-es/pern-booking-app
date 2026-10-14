// by claude: filter panel redesigned (chips, price slider based on real prices, sort dropdown)
import { useState } from "react";
import { SlidersHorizontal, ChevronDown, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import FacilityIcon from "../../../components/common/FacilityIcon";

const chipClass = (active) =>
  `inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition-colors cursor-pointer select-none ${
    active
      ? "border-gray-900 bg-gray-900 text-white"
      : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
  }`;

const Section = ({ title, children }) => (
  <div className="border-t border-gray-200 px-5 py-5 first:border-t-0">
    <p className="mb-3 text-sm font-semibold text-gray-900">{title}</p>
    {children}
  </div>
);

const FilterSidebar = ({
  roomTypes,
  amenities,
  sortOptions,
  bounds, // { min, max } real min / max price of the rooms
  filters, // { roomType: [], amenities: [], minPrice, maxPrice }
  sort,
  onToggle, // (key, value)
  onPrice, // (minPrice, maxPrice)
  onSort,
  onClear,
  activeCount,
  currency,
}) => {
  const [open, setOpen] = useState(false); // only used on mobile

  const minPrice = filters.minPrice ?? bounds.min;
  const maxPrice = filters.maxPrice ?? bounds.max;

  const panel = (
    <div>
      <Section title="Sort by">
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => onSort(e.target.value)}
            className="w-full cursor-pointer appearance-none rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 pr-9 text-sm text-gray-800 outline-none focus:border-gray-900"
          >
            <option value="">Recommended</option>
            {sortOptions.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        </div>
      </Section>

      <Section title="Room type">
        <div className="flex flex-wrap gap-2">
          {roomTypes.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onToggle("roomType", type)}
              className={chipClass(filters.roomType.includes(type))}
            >
              {type}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Price per night">
        <div className="flex items-center gap-2">
          {[
            ["Min", minPrice, (v) => onPrice(Math.min(v, maxPrice), maxPrice)],
            ["Max", maxPrice, (v) => onPrice(minPrice, Math.max(v, minPrice))],
          ].map(([label, value, set]) => (
            <label
              key={label}
              className="flex-1 rounded-xl border border-gray-200 px-3 py-2 focus-within:border-gray-900"
            >
              <span className="block text-[11px] uppercase tracking-wider text-gray-500">
                {label}
              </span>
              <span className="flex items-center gap-1 text-sm font-medium text-gray-900">
                {currency}
                <input
                  type="number"
                  min={bounds.min}
                  max={bounds.max}
                  value={value}
                  onChange={(e) =>
                    set(
                      Math.min(
                        bounds.max,
                        Math.max(bounds.min, Number(e.target.value) || 0),
                      ),
                    )
                  }
                  className="w-full bg-transparent outline-none"
                />
              </span>
            </label>
          ))}
        </div>
        <input
          type="range"
          aria-label="Maximum price per night"
          min={bounds.min}
          max={bounds.max}
          step={5}
          value={maxPrice}
          onChange={(e) =>
            onPrice(minPrice, Math.max(Number(e.target.value), minPrice))
          }
          className="mt-4 w-full cursor-pointer accent-gray-900"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>
            {currency}
            {bounds.min}
          </span>
          <span>
            {currency}
            {bounds.max}
          </span>
        </div>
      </Section>

      <Section title="Amenities">
        <div className="flex flex-wrap gap-2">
          {amenities.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onToggle("amenities", item)}
              className={chipClass(filters.amenities.includes(item))}
            >
              <FacilityIcon name={item} className="h-3.5 w-3.5" />
              {item}
            </button>
          ))}
        </div>
      </Section>
    </div>
  );

  // by claude: the sticky panel is capped to the screen height and scrolls inside,
  // so every filter stays reachable while the rooms list scrolls separately
  return (
    <aside className="w-full lg:w-80 lg:sticky lg:top-24 max-lg:mb-6 lg:mt-16 max-lg:overflow-hidden lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto overscroll-contain rounded-2xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between px-5 py-3.5">
        <p className="flex items-center gap-2 text-base font-semibold text-gray-900">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeCount > 0 && (
            <span className="rounded-full bg-gray-900 px-2 py-0.5 text-xs font-medium text-white">
              {activeCount}
            </span>
          )}
        </p>
        <div className="flex items-center gap-3 text-sm">
          {activeCount > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="inline-flex cursor-pointer items-center gap-1 text-gray-600 hover:text-gray-900"
            >
              <X className="h-3.5 w-3.5" /> Clear
            </button>
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="cursor-pointer font-medium text-gray-900 underline underline-offset-4 lg:hidden"
          >
            {open ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      {/* desktop: always visible */}
      <div className="hidden border-t border-gray-200 lg:block">{panel}</div>

      {/* mobile: collapsible */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="mobile-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-t border-gray-200 lg:hidden"
          >
            {panel}
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
};

export default FilterSidebar;
