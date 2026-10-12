import prisma from "../configs/prisma.js";
import resend from "../configs/resend.js";
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
        checkInDate: { lte: new Date(checkOutDate) },
        checkOutDate: { gte: new Date(checkInDate) },
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

    const isAvailable = await checkAvailability({
      checkInDate,
      checkOutDate,
      roomId,
    });
    if (!isAvailable) {
      return res.status(400).json({
        success: false,
        message: "Room is not available for these dates",
      });
    }

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

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    const timeDiff = checkOut.getTime() - checkIn.getTime();
    const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (nights <= 0) {
      return res.status(400).json({
        success: false,
        message: "Check-out date must be after check-in date",
      });
    }

    const totalPrice = roomData.pricePerNight * nights;

    const booking = await prisma.booking.create({
      data: {
        userId,
        roomId,
        hotelId: roomData.hotelId,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        totalPrice,
        guests: Number(guests),
      },
    });

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

export const getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: {
        room: true,
        hotel: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      bookings,
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

    const bookings = await prisma.booking.findMany({
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
    });

    const totalBokings = bookings.length;
    const totalRevenue = bookings.reduce(
      (acc, booking) => acc + booking.totalPrice,
      0,
    );

    res.status(200).json({
      success: true,
      dashboardData: {
        totalBokings,
        totalRevenue,
        bookings,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch hotel bookings",
    });
  }
};
