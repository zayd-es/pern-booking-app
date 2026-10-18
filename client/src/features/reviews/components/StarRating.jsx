// by claude: lucide stars instead of svg files
import { Star } from "lucide-react";

const StarRating = ({ rating = 4 }) => {
  return (
    <div className="flex items-center gap-1">
      {Array(5)
        .fill(0)
        .map((_, index) => (
          <Star
            key={index}
            aria-hidden="true"
            className={`h-4 w-4 ${
              rating > index
                ? "fill-amber-400 text-amber-400"
                : "text-gray-300"
            }`}
          />
        ))}
    </div>
  );
};

export default StarRating;
