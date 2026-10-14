// by claude: reviews. A guest can review a hotel once per PAID booking, after the stay is over.
import { z } from "zod";
import prisma from "../configs/prisma.js";

const reviewSchema = z.object({
  bookingId: z.string().min(1, "bookingId is required"),
  rating: z.coerce
    .number({ error: "Rating must be a number" })
    .int("Rating must be a whole number")
    .min(1, "Rating must be between 1 and 5")
    .max(5, "Rating must be between 1 and 5"),
  comment: z
    .string()
    .trim()
    .max(500, "Comment must be at most 500 characters")
    .optional(),
});

// { [hotelId]: { average: 4.6, count: 12 } } computed by the database for many hotels at once
export const getHotelRatings = async (hotelIds) => {
  if (!hotelIds.length) return {};
  const groups = await prisma.review.groupBy({
    by: ["hotelId"],
    where: { hotelId: { in: hotelIds } },
    _avg: { rating: true },
    _count: true,
  });
  return Object.fromEntries(
    groups.map((g) => [
      g.hotelId,
      { average: Math.round((g._avg.rating || 0) * 10) / 10, count: g._count },
    ]),
  );
};

export const createReview = async (req, res) => {
  try {
    const parsed = reviewSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: parsed.error.issues[0].message,
      });
    }
    const { bookingId, rating, comment } = parsed.data;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { review: { select: { id: true } } },
    });

    if (!booking || booking.userId !== req.user.id) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }
    if (booking.status !== "CONFIRMED") {
      return res.status(400).json({
        success: false,
        message: "Only paid bookings can be reviewed",
      });
    }
    if (new Date(booking.checkOutDate) > new Date()) {
      return res.status(400).json({
        success: false,
        message: "You can review a hotel after your stay",
      });
    }
    if (booking.review) {
      return res.status(409).json({
        success: false,
        message: "You already reviewed this booking",
      });
    }

    const review = await prisma.review.create({
      data: {
        rating,
        comment: comment || null,
        userId: req.user.id,
        hotelId: booking.hotelId,
        bookingId,
      },
    });

    return res
      .status(201)
      .json({ success: true, message: "Thanks for your review!", review });
  } catch (error) {
    // two requests at the same time: the unique bookingId protects us
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "You already reviewed this booking",
      });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// public: reviews of a hotel (paginated) + the average
export const getHotelReviews = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit, 10) || 5));

    const [total, reviews, ratings] = await Promise.all([
      prisma.review.count({ where: { hotelId } }),
      prisma.review.findMany({
        where: { hotelId },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          user: { select: { username: true, image: true } }, // no email
        },
      }),
      getHotelRatings([hotelId]),
    ]);

    return res.json({
      success: true,
      reviews,
      rating: ratings[hotelId] || { average: 0, count: 0 },
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// a guest can delete their own review
export const deleteReview = async (req, res) => {
  try {
    const review = await prisma.review.findUnique({
      where: { id: req.params.id },
    });
    if (!review || review.userId !== req.user.id) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }
    await prisma.review.delete({ where: { id: review.id } });
    return res.json({ success: true, message: "Review deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
