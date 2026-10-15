import { clerkClient } from "@clerk/express"; // by claude
import prisma from "../configs/prisma.js";

export const protect = async (req, res, next) => {
  try {
    const { userId } = req.auth();
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "not authenticated" });
    }
    let user = await prisma.user.findUnique({
      where: { id: userId },
    });
    // by claude: the Clerk webhook can be late or missing (e.g. a new account right after sign-up).
    // Build the user from Clerk itself instead of answering "User not found".
    if (!user) {
      const c = await clerkClient.users.getUser(userId);
      const email =
        c.emailAddresses.find((e) => e.id === c.primaryEmailAddressId)
          ?.emailAddress ||
        c.emailAddresses[0]?.emailAddress ||
        "";
      const data = {
        email,
        username: `${c.firstName || ""} ${c.lastName || ""}`.trim() || userId,
        image: c.imageUrl || "",
      };
      user = await prisma.user.upsert({
        where: { id: userId },
        create: { id: userId, ...data },
        update: {},
      });
    }
    req.user = user;

    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
