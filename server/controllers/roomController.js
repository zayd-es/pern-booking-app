import prisma from "../configs/prisma.js";
import cloudinary from "../configs/cloudinary.js";
import { z } from "zod";
import fs from "fs/promises"; // by claude

const createRoomSchema = z.object({
  roomType: z.string().min(1, "Room type is required"),
  pricePerNight: z.coerce
    .number({ error: "Price must be a valid number" })
    .positive("Price per night must be greater than 0"),
  description: z.string().optional().default(""),
  amenities: z.array(z.string()).default([]),
});

export const createRoom = async (req, res) => {
  try {
    // 1. Convert/Parse Amenities mansawch JSON stringify
    let parsedAmenities = [];
    if (req.body.amenities) {
      try {
        parsedAmenities =
          typeof req.body.amenities === "string"
            ? JSON.parse(req.body.amenities)
            : req.body.amenities;
      } catch (e) {
        parsedAmenities = [];
      }
    }

    // 2. Validate b Zod (safeParse)
    const validationResult = createRoomSchema.safeParse({
      ...req.body,
      amenities: parsedAmenities,
    });

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: validationResult.error.issues[0].message,
      });
    }

    const { roomType, pricePerNight, description, amenities } =
      validationResult.data;

    // 3. Validation d l-Images
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please upload at least one room image",
      });
    }

    // 4. Find Hotel
    const hotel = await prisma.hotel.findFirst({
      where: { ownerId: req.user.id },
    });

    if (!hotel) {
      return res
        .status(404)
        .json({ success: false, message: "No hotel found" });
    }

    // 5. Upload to Cloudinary
    const uploadImages = req.files.map(async (file) => {
      const response = await cloudinary.uploader.upload(file.path);
      return response.secure_url;
    });
    const images = await Promise.all(uploadImages);

    // 6. Prisma Create
    await prisma.room.create({
      data: {
        hotelId: hotel.id,
        roomType,
        pricePerNight,
        description,
        amenities,
        images,
      },
    });

    return res.json({
      success: true,
      message: "Room created successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    // by claude: always delete the temp files multer wrote to disk
    await Promise.all(
      (req.files || []).map((f) => fs.unlink(f.path).catch(() => {})),
    );
  }
};

export const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const room = await prisma.room.findUnique({
      where: { id },
      include: { hotel: true },
    });
    if (!room) {
      return res
        .status(404)
        .json({ success: false, message: "Room not found" });
    }
    if (room.hotel.ownerId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized. You can only delete your own rooms.",
      });
    }
    // by claude: block delete when the room has an active/future booking
    const activeBooking = await prisma.booking.findFirst({
      where: {
        roomId: id,
        status: { not: "CANCELLED" },
        checkOutDate: { gte: new Date() },
      },
    });
    if (activeBooking) {
      return res.status(400).json({
        success: false,
        message:
          "This room has active bookings. Cancel them first or turn off its availability instead.",
      });
    }
    if (room.images && room.images.length > 0) {
      await Promise.all(
        room.images.map(async (imgUrl) => {
          try {
            const publicId = imgUrl.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(publicId);
          } catch (imgErr) {
            console.error("Error deleting image from cloudinary:", imgErr);
          }
        }),
      );
    }
    // by claude: only cancelled/past bookings are left here
    await prisma.booking.deleteMany({ where: { roomId: id } });
    await prisma.room.delete({
      where: { id },
    });
    return res.json({
      success: true,
      message: "Room deleted successfully",
    });
  } catch (error) {
    console.error("Delete room error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete room",
    });
  }
};

export const getRooms = async (req, res) => {
  try {
    const rooms = await prisma.room.findMany({
      where: {
        isAvailable: true,
      },
      include: {
        hotel: {
          include: {
            owner: {
              select: {
                image: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json({ success: true, rooms });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getOwnerRooms = async (req, res) => {
  try {
    const rooms = await prisma.room.findMany({
      where: {
        hotel: { ownerId: req.user.id },
      },
      include: {
        hotel: { select: { city: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ success: true, rooms });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleRoomAvailability = async (req, res) => {
  try {
    const { roomId } = req.body;

    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { hotel: { select: { ownerId: true } } },
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    if (room.hotel.ownerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized. You can only update your own rooms.",
      });
    }

    const updatedRoom = await prisma.room.update({
      where: { id: roomId },
      data: {
        isAvailable: !room.isAvailable,
      },
    });

    return res.json({
      success: true,
      message: "Room availability updated",
      isAvailable: updatedRoom.isAvailable,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
