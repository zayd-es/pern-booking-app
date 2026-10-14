// by claude: numbered pagination  ‹ 1 2 3 … 9 ›  (reusable: rooms, bookings, dashboard)
import { ChevronLeft, ChevronRight } from "lucide-react";

// 1 … 4 5 6 … 12  (always first, last, and the pages around the current one)
const getPages = (page, totalPages) => {
  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  if (page <= 3) [2, 3, 4].forEach((p) => pages.add(p));
  if (page >= totalPages - 2) {
    [totalPages - 1, totalPages - 2, totalPages - 3].forEach((p) => pages.add(p));
  }
  const sorted = [...pages]
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b);

  const result = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) result.push("gap-" + p);
    result.push(p);
  });
  return result;
};

const buttonBase =
  "flex h-9 min-w-9 items-center justify-center rounded-full px-3 text-sm transition-colors";

const Pagination = ({ page, totalPages, onChange, className = "" }) => {
  if (!totalPages || totalPages <= 1) return null;

  return (
    <nav
      aria-label="Pagination"
      className={`flex flex-wrap items-center justify-center gap-1.5 ${className}`}
    >
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        className={`${buttonBase} border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer`}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {getPages(page, totalPages).map((item) =>
        typeof item === "string" ? (
          <span key={item} className="px-1 text-gray-400" aria-hidden="true">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            aria-current={item === page ? "page" : undefined}
            aria-label={`Page ${item}`}
            className={`${buttonBase} cursor-pointer ${
              item === page
                ? "bg-gray-900 font-medium text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
        className={`${buttonBase} border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer`}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
};

export default Pagination;
