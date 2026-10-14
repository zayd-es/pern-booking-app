export const RadioButton = ({
  label,
  selected = false,
  onChange = () => {},
}) => {
  return (
    <label className="flex gap-3 items-center cursor-pointer mt-2 text-sm">
      <input
        type="radio"
        name="sortOption"
        checked={selected}
        onChange={() => {
          onChange(label);
        }}
        className="accent-gray-900" // by claude
      />
      <span className="font-light select-none">{label}</span>
    </label>
  );
};

export const CheckBox = ({ label, selected = false, onChange = () => {} }) => {
  return (
    <label className="flex gap-3 items-center cursor-pointer mt-2 text-sm">
      <input
        type="checkbox"
        checked={selected}
        onChange={(e) => onChange(e.target.checked, label)}
        className="accent-gray-900" // by claude
      />
      <span className="font-light select-none">{label}</span>
    </label>
  );
};

const FilterSidebar = ({
  openFilters,
  setOpenFilters,
  clearFilter,
  roomTypes,
  priceRanges,
  sortOptions,
  selectedFilters,
  selectedSort,
  handleFilterChange,
  handleSortChange,
  currency,
}) => {
  return (
    <div className="bg-white w-80 border border-gray-200 text-gray-600 max-lg:mb-8 min-lg:mt-16 rounded-2xl overflow-hidden">
      <div
        className={`flex items-center justify-between px-5 py-2.5 min-lg:border-b border-gray-200 ${
          openFilters ? "border-b" : ""
        }`}
      >
        <p className="text-base font-medium text-gray-800">FILTERS</p>
        <div className="text-xs cursor-pointer">
          <span
            onClick={() => setOpenFilters(!openFilters)}
            className="lg:hidden"
          >
            {openFilters ? "HIDE" : "SHOW"}
          </span>
          <span
            onClick={clearFilter}
            className="hidden lg:block cursor-pointer hover:underline"
          >
            Clear
          </span>
        </div>
      </div>

      <div
        className={`overflow-hidden transition-all duration-700 ${
          openFilters ? "h-auto" : "h-0 lg:h-auto"
        }`}
      >
        {/* Room Type */}
        <div className="p-5 pt-5">
          <p className="font-medium text-gray-800 pb-2">Popular Filters</p>
          {roomTypes.map((room) => (
            <CheckBox
              key={room}
              label={room}
              selected={selectedFilters.roomType.includes(room)}
              onChange={(checked) =>
                handleFilterChange(checked, room, "roomType")
              }
            />
          ))}
        </div>

        {/* Price Range */}
        <div className="p-5 pt-5 border-t border-gray-200">
          <p className="font-medium text-gray-800 pb-2">Price Range</p>
          {priceRanges.map((range) => (
            <CheckBox
              key={range}
              label={`${currency}${range}`}
              selected={selectedFilters.priceRange.includes(range)}
              onChange={(checked) =>
                handleFilterChange(checked, range, "priceRange")
              }
            />
          ))}
        </div>

        {/* Sort Options */}
        <div className="p-5 pt-5 border-t border-gray-200">
          <p className="font-medium text-gray-800 pb-2">Sort By</p>
          {sortOptions.map((option) => (
            <RadioButton
              key={option}
              label={option}
              selected={selectedSort === option}
              onChange={handleSortChange}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
