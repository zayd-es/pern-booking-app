import prisma from "../configs/prisma.js";

export const registerHotel = async (req, res) => {
  try {
    const { name, address, contact, city } = req.body;
    const userId = req.user.id;

    if (!name || !address || !contact || !city) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }
    const excistingHotel = await prisma.hotel.findFirst({
      where: { ownerId: userId },
    });

    if (excistingHotel) {
      return res
        .status(409)
        .json({ success: false, message: "Hotel Already Registered" });
    }
    await prisma.hotel.create({
      data: {
        name,
        address,
        contact,
        city,
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
