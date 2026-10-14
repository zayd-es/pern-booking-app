import prisma from "../configs/prisma.js";
import resend from "../configs/resend.js";
import Stripe from "stripe";
export const checkAvailability = async ({
  roomId,
  checkInDate,
  checkOutDate,
}) => {
  try {
    const excistingBooking = await prisma.booking.findFirst({
      where: {
        roomId,
        status: { not: "CANCELLED" },
        // by claude: strict < / > so check-out day = next guest's check-in day is allowed
        checkInDate: { lt: new Date(checkOutDate) },
        checkOutDate: { gt: new Date(checkInDate) },
      },
    });
    return !excistingBooking;
  } catch (error) {
    console.error(error.message);
    return false;
  }
};

export const checkAvailabilityApi = async (req, res) => {
  try {
    const { roomId, checkInDate, checkOutDate } = req.body;
    const isAvailable = await checkAvailability({
      checkInDate,
      checkOutDate,
      roomId,
    });
    return res.json({
      success: true,
      isAvailable,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createBooking = async (req, res) => {
  try {
    const { checkInDate, checkOutDate, roomId, guests } = req.body;
    const userId = req.user.id;

    // by claude: validate room, dates and guests first
    const roomData = await prisma.room.findUnique({
      where: { id: roomId },
      include: { hotel: true },
    });
    if (!roomData) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }
    if (!roomData.isAvailable) {
      return res.status(400).json({
        success: false,
        message: "This room is currently not available for booking",
      });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid dates",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (checkIn < today) {
      return res.status(400).json({
        success: false,
        message: "Check-in date can't be in the past",
      });
    }

    const timeDiff = checkOut.getTime() - checkIn.getTime();
    const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (nights <= 0) {
      return res.status(400).json({
        success: false,
        message: "Check-out date must be after check-in date",
      });
    }

    const guestsCount = Number(guests);
    if (!Number.isInteger(guestsCount) || guestsCount < 1) {
      return res.status(400).json({
        success: false,
        message: "Guests must be a valid number",
      });
    }

    const totalPrice = roomData.pricePerNight * nights;

    // by claude: availability check + create in ONE serializable transaction
    // (two users can't book the same dates at the same time anymore)
    let booking;
    try {
      booking = await prisma.$transaction(
        async (tx) => {
          // by claude: query directly (checkAvailability swallows errors, we need P2034 to bubble up)
          const overlap = await tx.booking.findFirst({
            where: {
              roomId,
              status: { not: "CANCELLED" },
              // by claude: strict < / > (same-day turnover allowed)
              checkInDate: { lt: checkOut },
              checkOutDate: { gt: checkIn },
            },
          });
          if (overlap) return null;
          return tx.booking.create({
            data: {
              userId,
              roomId,
              hotelId: roomData.hotelId,
              checkInDate: checkIn,
              checkOutDate: checkOut,
              totalPrice,
              guests: guestsCount,
            },
          });
        },
        { isolationLevel: "Serializable" },
      );
    } catch (txError) {
      // P2034 = write conflict / deadlock between concurrent bookings
      if (txError.code === "P2034") {
        return res.status(409).json({
          success: false,
          message: "Someone just booked this room, please try again",
        });
      }
      throw txError;
    }

    if (!booking) {
      return res.status(400).json({
        success: false,
        message: "Room is not available for these dates",
      });
    }

    const toEmail =
      req.user?.email ||
      req.user?.emailAddresses?.[0]?.emailAddress ||
      req.auth?.sessionClaims?.email;

    if (!toEmail) {
      console.error("User email is missing (check Clerk/middleware).");
    } else {
      try {
        const { data, error } = await resend.emails.send({
          from: "Hotel Booking <onboarding@resend.dev>",
          to: [toEmail],
          subject: "Hotel Booking Details",
          html: `
            <h2>Your Booking Details</h2>
            <p>Dear ${req.user.username || "Guest"},</p>
            <p>Thank you for your booking! Here are your details:</p>
            <ul>
              <li><strong>Booking ID:</strong> ${booking.id}</li>
              <li><strong>Hotel Name:</strong> ${roomData.hotel.name}</li>
              <li><strong>Location:</strong> ${roomData.hotel.address}</li>
              <li><strong>Check-in:</strong> ${booking.checkInDate.toDateString()}</li>
              <li><strong>Check-out:</strong> ${booking.checkOutDate.toDateString()}</li>
              <li><strong>Total Amount:</strong> ${process.env.CURRENCY || "$"} ${booking.totalPrice}</li>
            </ul>
            <p>We look forward to welcoming you!</p>
            <p>If you need to make any changes, feel free to contact us.</p>
          `,
        });

        if (error) {
          console.error("Resend error:", error);
        } else {
          console.log(`Confirmation sent to ${toEmail} (id: ${data.id})`);
        }
      } catch (emailError) {
        console.error("Failed to send email:", emailError.message);
      }
    }

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    console.error("Booking error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// by claude: ?page=1&limit=10 -> safe numbers (limit is capped so nobody can ask for everything)
const getPagination = (query, defaultLimit = 10, maxLimit = 50) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
  return { page, limit, skip: (page - 1) * limit };
};

export const getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page, limit, skip } = getPagination(req.query);

    const [total, bookings] = await Promise.all([
      prisma.booking.count({ where: { userId } }),
      prisma.booking.findMany({
        where: { userId },
        include: {
          room: true,
          hotel: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ]);

    return res.status(200).json({
      success: true,
      bookings,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
    });
  }
};

export const getHotelBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const hotel = await prisma.hotel.findFirst({
      where: { ownerId: userId },
    });

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "No Hotel found for this owner",
      });
    }

    const { page, limit, skip } = getPagination(req.query);

    // by claude: stats are computed by the database over ALL bookings,
    // only the table below is paginated
    const [totalBookings, confirmed, potential, bookings] = await Promise.all([
      prisma.booking.count({ where: { hotelId: hotel.id } }),
      prisma.booking.aggregate({
        where: { hotelId: hotel.id, status: "CONFIRMED" },
        _count: true,
        _sum: { totalPrice: true },
      }),
      // cancelled bookings don't count in potential revenue
      prisma.booking.aggregate({
        where: { hotelId: hotel.id, status: { not: "CANCELLED" } },
        _sum: { totalPrice: true },
      }),
      prisma.booking.findMany({
        where: { hotelId: hotel.id },
        include: {
          room: true,
          hotel: true,
          user: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ]);

    res.status(200).json({
      success: true,
      dashboardData: {
        totalBookings,
        confirmedBookings: confirmed._count,
        confirmedRevenue: confirmed._sum.totalPrice || 0,
        totalRevenue: potential._sum.totalPrice || 0,
        bookings,
        pagination: {
          page,
          limit,
          total: totalBookings,
          totalPages: Math.ceil(totalBookings / limit),
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch hotel bookings",
    });
  }
};

// by claude: cancel a booking.
// - unpaid booking: guest or hotel owner can cancel
// - paid booking (Stripe): the guest can cancel (full refund) if check-in is more than
//   FREE_CANCELLATION_HOURS away; the hotel owner can always cancel (full refund)
const FREE_CANCELLATION_HOURS = 48;

export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { hotel: { select: { ownerId: true } } },
    });

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    const isGuest = booking.userId === userId;
    const isHotelOwner = booking.hotel.ownerId === userId;

    if (!isGuest && !isHotelOwner) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to cancel this booking",
      });
    }

    if (booking.status === "CANCELLED") {
      return res
        .status(400)
        .json({ success: false, message: "Booking is already cancelled" });
    }

    if (new Date(booking.checkOutDate) < new Date()) {
      return res.status(400).json({
        success: false,
        message: "This booking is already completed",
      });
    }

    const isPaid = booking.status === "CONFIRMED";

    // a guest can only cancel a paid booking with enough notice
    if (isPaid && !isHotelOwner) {
      const hoursLeft =
        (new Date(booking.checkInDate).getTime() - Date.now()) / 36e5;
      if (hoursLeft < FREE_CANCELLATION_HOURS) {
        return res.status(400).json({
          success: false,
          message: `Free cancellation is only possible more than ${FREE_CANCELLATION_HOURS} hours before check-in. Please contact the hotel.`,
        });
      }
    }

    // refund first: if Stripe fails we do NOT cancel, so money and booking stay consistent
    let refunded = false;
    if (isPaid && booking.paymentMethod === "Stripe") {
      if (booking.paymentIntentId) {
        try {
          const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
          await stripeInstance.refunds.create(
            { payment_intent: booking.paymentIntentId },
            { idempotencyKey: `refund_${booking.id}` },
          );
          refunded = true;
        } catch (stripeError) {
          console.error("Stripe refund error:", stripeError.message);
          return res.status(502).json({
            success: false,
            message: "The refund failed, the booking was not cancelled. Please try again.",
          });
        }
      }
    }

    await prisma.booking.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    // old paid bookings (made before refunds existed) have no paymentIntentId
    const needsManualRefund =
      isPaid && booking.paymentMethod === "Stripe" && !refunded;

    return res.json({
      success: true,
      refunded,
      message: refunded
        ? "Booking cancelled and the payment was refunded (5-10 business days to appear on the card)."
        : needsManualRefund
          ? "Booking cancelled. This payment can't be refunded automatically, please refund it from your Stripe dashboard."
          : "Booking cancelled successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const stripePayment = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const { origin } = req.headers;
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        room: {
          include: { hotel: true },
        },
      },
    });
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }
    // by claude: only the guest who made the booking can pay, and only if still pending
    if (booking.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to pay for this booking",
      });
    }
    if (booking.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: "This booking can't be paid",
      });
    }
    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
    const line_items = [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: booking.room.hotel.name,
          },
          unit_amount: Math.round(booking.totalPrice * 100),
        },
        quantity: 1,
      },
    ];
    const session = await stripeInstance.checkout.sessions.create({
      line_items,
      mode: "payment",
      success_url: `${origin}/loader/my-bookings?success=true`,
      cancel_url: `${origin}/my-bookings?canceled=true`,
      metadata: {
        bookingId: booking.id,
      },
    });

    res.json({ success: true, url: session.url });
  } catch (error) {
    console.error("Stripe Payment Error:", error);
    res
      .status(500)
      .json({ success: false, message: error.message || "Payment Failed" });
  }
};
