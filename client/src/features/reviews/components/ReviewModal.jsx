// by claude: popup where a guest rates a finished stay (1-5 stars + optional comment)
import { useEffect, useState } from "react";
import { Star, X } from "lucide-react";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import { createReview, updateReview } from "@/features/reviews/api";

const LABELS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

// by claude: pass `review` (+ hotelName) instead of `booking` to edit an existing review
const ReviewModal = ({ booking, review, hotelName, onClose, onDone }) => {
  const { getToken } = useAuth();
  const [rating, setRating] = useState(review?.rating || 0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState(review?.comment || "");
  const [saving, setSaving] = useState(false);

  // Escape closes the popup
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = async (e) => {
    e.preventDefault();
    if (!rating) return toast.error("Please choose a rating");
    setSaving(true);
    try {
      const headers = { Authorization: `Bearer ${await getToken()}` };
      const { data } = review
        ? await updateReview(review.id, { rating, comment }, { headers })
        : await createReview({ bookingId: booking.id, rating, comment }, { headers });
      if (data.success) {
        toast.success(data.message);
        onDone(review ? review.id : booking.id, data.review);
        onClose();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to send the review");
    } finally {
      setSaving(false);
    }
  };

  const shown = hover || rating;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Rate your stay"
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 cursor-pointer rounded-full p-1 hover:bg-gray-100"
        >
          <X className="h-4 w-4" />
        </button>

        <h2 className="text-xl font-semibold text-gray-900">{review ? "Edit your review" : "Rate your stay"}</h2>
        <p className="mt-1 text-sm text-gray-500">{hotelName || booking.hotel.name}</p>

        <div
          className="mt-5 flex items-center gap-1"
          onMouseLeave={() => setHover(0)}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onMouseEnter={() => setHover(n)}
              onClick={() => setRating(n)}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              className="cursor-pointer p-0.5"
            >
              <Star
                className={`h-8 w-8 transition-colors ${
                  n <= shown
                    ? "fill-amber-400 text-amber-400"
                    : "text-gray-300"
                }`}
              />
            </button>
          ))}
          <span className="ml-2 text-sm text-gray-500">{LABELS[shown]}</span>
        </div>

        <label className="mt-5 block text-sm font-medium text-gray-800">
          Your comment <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <textarea
          rows={4}
          maxLength={500}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What did you like? What could be better?"
          className="mt-1.5 w-full resize-none rounded-xl border border-gray-300 p-3 text-sm outline-none focus:border-gray-900"
        />
        <p className="mt-1 text-right text-xs text-gray-400">
          {comment.length}/500
        </p>

        <button
          type="submit"
          disabled={saving}
          className="mt-3 w-full cursor-pointer rounded-full bg-gray-900 py-2.5 text-sm font-medium text-white transition-colors hover:bg-black disabled:opacity-60"
        >
          {saving ? "Sending..." : review ? "Save changes" : "Send review"}
        </button>
      </form>
    </div>
  );
};

export default ReviewModal;
