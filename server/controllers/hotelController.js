import prisma from "../configs/prisma.js";
import { z } from "zod";
import cloudinary from "../configs/cloudinary.js";
import { getHotelRatings } from "./reviewController.js"; // by claude
import { MOROCCAN_CITIES, COUNTRY } from "../configs/cities.js"; // by claude

const hotelRegisterSchema = z.object({
  name: z.string().min(3, "Hotel name must be at least 3 characters"),
  address: z.string().min(5, "Address is too short"),
  contact: z.string().min(5, "Contact number/email is required"),
  // by claude: only Moroccan cities / Morocco are accepted
  // by claude: optional description (max 600 chars)
  description: z
    .string()
    .trim()
    .max(600, "Description must be at most 600 characters")
    .optional(),
  city: z.enum(MOROCCAN_CITIES, { error: "Please choose a Moroccan city" }),
  country: z.literal(COUNTRY, { error: "Only Morocco is supported" }),
});

export const registerHotel = async (req, res) => {
  try {
    const validationResult = hotelRegisterSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: validationResult.error.issues[0].message,
      });
    }

    const { name, address, contact, city, country, description } =
      validationResult.data;
    const userId = req.user.id;

    const existingHotel = await prisma.hotel.findFirst({
      where: { ownerId: userId },
    });

    if (existingHotel) {
      return res
        .status(409)
        .json({ success: false, message: "Hotel Already Registered" });
    }

    await prisma.hotel.create({
      data: {
        name,
        address,
        contact,
        description: description || null, // by claude
        city,
        country,
        ownerId: userId,
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { role: "hotelOwner" },
    });

    return res
      .status(201)
      .json({ success: true, message: "Hotel Registered Successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyHotel = async (req, res) => {
  try {
    const hotel = await prisma.hotel.findFirst({
      where: { ownerId: req.user.id },
    });

    if (!hotel) {
      return res
        .status(404)
        .json({ success: false, message: "No hotel found" });
    }

    return res.json({ success: true, hotel });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateMyHotel = async (req, res) => {
  try {
    const validationResult = hotelRegisterSchema.partial().safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: validationResult.error.issues[0].message,
      });
    }

    if (Object.keys(validationResult.data).length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No fields to update" });
    }

    const hotel = await prisma.hotel.findFirst({
      where: { ownerId: req.user.id },
    });

    if (!hotel) {
      return res
        .status(404)
        .json({ success: false, message: "No hotel found" });
    }

    const updatedHotel = await prisma.hotel.update({
      where: { id: hotel.id },
      data: validationResult.data,
    });

    return res.json({
      success: true,
      message: "Hotel updated successfully",
      hotel: updatedHotel,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteMyHotel = async (req, res) => {
  try {
    const userId = req.user.id;

    const hotel = await prisma.hotel.findFirst({
      where: { ownerId: userId },
      include: { rooms: { select: { images: true } } },
    });

    if (!hotel) {
      return res
        .status(404)
        .json({ success: false, message: "No hotel found" });
    }

    const activeBookings = await prisma.booking.count({
      where: {
        hotelId: hotel.id,
        status: { in: ["PENDING", "CONFIRMED"] },
        checkOutDate: { gte: new Date() },
      },
    });

    if (activeBookings > 0) {
      return res.status(409).json({
        success: false,
        message: "You have active bookings. Cancel or complete them first.",
      });
    }

    const images = hotel.rooms.flatMap((room) => room.images);
    await Promise.all(
      images.map(async (imgUrl) => {
        try {
          const publicId = imgUrl.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(publicId);
        } catch (imgErr) {
          console.error("Error deleting image from cloudinary:", imgErr);
        }
      }),
    );

    await prisma.$transaction([
      prisma.booking.deleteMany({ where: { hotelId: hotel.id } }),
      prisma.hotel.delete({ where: { id: hotel.id } }),
      prisma.user.update({ where: { id: userId }, data: { role: "user" } }),
    ]);

    return res.json({ success: true, message: "Hotel deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// by claude: PUBLIC hotel page data (safe fields only: no contact, no ownerId) + its available rooms
export const getHotelById = async (req, res) => {
  try {
    const hotel = await prisma.hotel.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        name: true,
        description: true,
        address: true,
        city: true,
        country: true,
        createdAt: true,
        owner: { select: { image: true } },
        rooms: {
          where: { isAvailable: true },
          orderBy: { pricePerNight: "asc" },
          select: {
            id: true,
            roomType: true,
            description: true,
            pricePerNight: true,
            amenities: true,
            images: true,
          },
        },
      },
    });

    if (!hotel) {
      return res
        .status(404)
        .json({ success: false, message: "Hotel not found" });
    }

    const ratings = await getHotelRatings([hotel.id]); // by claude
    hotel.rating = ratings[hotel.id] || { average: 0, count: 0 };

    return res.json({ success: true, hotel });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
