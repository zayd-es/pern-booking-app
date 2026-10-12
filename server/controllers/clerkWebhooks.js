import { Webhook } from "svix";
import prisma from "../configs/prisma.js";

const getPrimaryEmail = (data) =>
  data.email_addresses?.find((e) => e.id === data.primary_email_address_id)
    ?.email_address ||
  data.email_addresses?.[0]?.email_address ||
  "";

const getUsername = (data) =>
  `${data.first_name || ""} ${data.last_name || ""}`.trim() || data.id;

export const clerkWebhooks = async (req, res) => {
  let event;

  // 1) Verify signature (400 if invalid)
  try {
    if (!Buffer.isBuffer(req.body)) {
      throw new Error(
        "Raw body required: use express.raw() on the webhook route",
      );
    }

    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    event = whook.verify(req.body.toString("utf8"), {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    });
  } catch (error) {
    console.error("Webhook verification failed:", error.message);
    return res.status(400).json({ success: false, message: error.message });
  }

  // 2) Handle event (500 if DB fails, so Clerk retries)
  try {
    const { data, type } = event;

    switch (type) {
      case "user.created":
      case "user.updated": {
        const userData = {
          email: getPrimaryEmail(data),
          username: getUsername(data),
          image: data.image_url || "",
        };

        await prisma.user.upsert({
          where: { id: data.id },
          create: { id: data.id, ...userData },
          update: userData,
        });
        break;
      }

      case "user.deleted":
        await prisma.user.deleteMany({ where: { id: data.id } });
        break;

      default:
        break;
    }

    return res.json({ success: true, message: `${type} processed` });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
