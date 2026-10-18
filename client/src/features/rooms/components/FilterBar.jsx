// by claude: compact horizontal filter bar (dropdown panels) instead of the big sidebar,
// so the room cards can use the full width of the page
import { useEffect, useRef, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import FacilityIcon from "@/features/rooms/components/FacilityIcon";

const chipClass = (active) =>
  `inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[13px] transition-colors cursor-pointer select-none ${
    active
      ? "border-gray-900 bg-gray-900 text-white"
      : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
  }`;

// a button that opens a small panel under it (closes on outside click / Escape / scroll / resize).
// The panel is position:fixed and clamped to the screen, so it never overflows on a phone and is
// not clipped by the horizontally scrollable bar.
const PANEL_WIDTH = 288; // 18rem

const Dropdown = ({ label, count = 0, children }) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: PANEL_WIDTH });
  const wrapRef = useRef(null);
  const buttonRef = useRef(null);

  const toggle = () => {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const width = Math.min(PANEL_WIDTH, window.innerWidth - 32);
      const left = Math.max(16, Math.min(rect.left, window.innerWidth - width - 16));
      setPos({ top: rect.bottom + 8, left, width });
    }
    setOpen((v) => !v);
  };

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const onClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) close();
    };
    const onKey = (e) => e.key === "Escape" && close();
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", close, { passive: true });
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", close);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="shrink-0">
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className={`inline-flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-sm transition-colors ${
          count > 0 || open
            ? "border-gray-900 text-gray-900"
            : "border-gray-200 text-gray-700 hover:border-gray-400"
        }`}
      >
        {label}
        {count > 0 && (
          <span className="rounded-full bg-gray-900 px-1.5 text-xs font-medium text-white">
            {count}
          </span>
        )}
        <ChevronDown
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div
          style={{ top: pos.top, left: pos.left, width: pos.width }}
          className="fixed z-40 rounded-2xl border border-gray-200 bg-white p-4 shadow-lg"
        >
          {children}
        </div>
      )}
    </div>
  );
};

const FilterBar = ({
  roomTypes,
  amenities,
  sortOptions,
  bounds,
  filters,
  sort,
  onToggle,
  onPrice,
  onSort,
  onClear,
  activeCount,
  currency,
}) => {
  const minPrice = filters.minPrice ?? bounds.min;
  const maxPrice = filters.maxPrice ?? bounds.max;
  const priceActive = filters.minPrice !== null || filters.maxPrice !== null;

  // phones: one horizontally scrollable row (no scrollbar); sm and up: wraps
  return (
    <div className="-mx-4 flex items-center gap-2.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
      <Dropdown label="Room type" count={filters.roomType.length}>
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
      </Dropdown>

      <Dropdown label="Price" count={priceActive ? 1 : 0}>
        <div className="flex items-center gap-2">
          {[
            ["Min", minPrice, (v) => onPrice(Math.min(v, maxPrice), maxPrice)],
            ["Max", maxPrice, (v) => onPrice(minPrice, Math.max(v, minPrice))],
          ].map(([label, value, set]) => (
            <label
              key={label}
              className="flex-1 rounded-xl border border-gray-200 px-3 py-1.5 focus-within:border-gray-900"
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
          className="mt-3 w-full cursor-pointer accent-gray-900"
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
      </Dropdown>

      <Dropdown label="Amenities" count={filters.amenities.length}>
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
      </Dropdown>

      <div className="relative shrink-0">
        <select
          aria-label="Sort rooms"
          value={sort}
          onChange={(e) => onSort(e.target.value)}
          className="cursor-pointer appearance-none rounded-full border border-gray-200 bg-white py-2 pl-4 pr-9 text-sm text-gray-700 outline-none hover:border-gray-400 focus:border-gray-900"
        >
          <option value="">Sort: Recommended</option>
          {sortOptions.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
      </div>

      {activeCount > 0 && (
        <button
          type="button"
          onClick={onClear}
          className="inline-flex shrink-0 cursor-pointer items-center gap-1 whitespace-nowrap px-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <X className="h-3.5 w-3.5" /> Clear all
        </button>
      )}
    </div>
  );
};

export default FilterBar;
