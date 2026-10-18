// by claude: real rating of a hotel ("★ 4.6 (12)"), or "New" when nobody reviewed it yet
import { Star } from "lucide-react";

const RatingBadge = ({ rating, className = "", showCount = true }) => {
  const count = rating?.count || 0;

  if (!count) {
    return (
      <span className={`shrink-0 text-sm font-medium text-gray-500 ${className}`}>
        New
      </span>
    );
  }

  return (
    <span
      className={`flex shrink-0 items-center gap-1 text-sm font-medium text-gray-700 ${className}`}
    >
      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
      {rating.average.toFixed(1)}
      {showCount && <span className="font-normal text-gray-400">({count})</span>}
    </span>
  );
};

export default RatingBadge;
