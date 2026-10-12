import prisma from "../configs/prisma.js";

export const protect = async (req, res, next) => {
  try {
    const { userId } = req.auth();
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "not authenticated" });
    }
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    req.user = user;

    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
