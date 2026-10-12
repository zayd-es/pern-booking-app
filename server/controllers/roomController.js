import prisma from "../configs/prisma.js";
import cloudinary from "../configs/cloudinary.js";
export const createRoom = async (req, res) => {
  try {
    const { roomType, pricePerNight, amenities } = req.body;

    const hotel = await prisma.hotel.findFirst({
      where: { owner: req.auth.userId },
    });
    if (!hotel) {
      return res
        .status(404)
        .json({ success: false, message: "No hotel found" });
    }
    const uploadImages = req.files.map(async (file) => {
      const response = await cloudinary.uploader.upload(file.path);
      return response.secure_url;
    });
    const images = await Promise.all(uploadImages);
    await prisma.room.create({
      data: {
        hotelId: hotel.id,
        roomType,
        pricePerNight: Number(pricePerNight),
        amenities:
          typeof amenities === "string" ? JSON.parse(amenities) : amenities,
        images,
      },
    });
    return res.json({
      success: true,
      message: "Room created successfully",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
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
        hotel: {
          ownerId: req.auth.userId,
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

export const toggleRoomAvailability = async (req, res) => {
  try {
    const { roomId } = req.body;

    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
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
