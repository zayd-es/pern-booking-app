import express from "express";
import "dotenv/config";
import cors from "cors";
import helmet from "helmet"; // by claude
import rateLimit from "express-rate-limit"; // by claude
import { clerkMiddleware } from "@clerk/express";
import { clerkWebhooks } from "./controllers/clerkWebhooks.js";
import userRouter from "./routes/user.js";
import hotelRouter from "./routes/hotel.js";
import roomRouter from "./routes/room.js";
import bookingRouter from "./routes/booking.js";
import reviewRouter from "./routes/review.js"; // by claude
import { stripeWebhooks } from "./controllers/stripeWebhooks.js";

const app = express();

// by claude: Vercel sits behind a proxy, needed so rate limiting sees the real client IP
app.set("trust proxy", 1);
// by claude: secure HTTP headers
app.use(helmet());

// by claude: only allow our own frontend(s). Set CLIENT_URL (comma separated) in the server env.
// If it is not set we stay permissive so nothing breaks, but you should set it in production.
// normalize each entry: trim spaces/quotes, drop a trailing "/", ignore case
const normalizeOrigin = (o) =>
  o.trim().replace(/^["']|["']$/g, "").replace(/\/+$/, "").toLowerCase();
const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map(normalizeOrigin)
  .filter(Boolean);
app.use(
  cors(
    allowedOrigins.length
      ? {
          origin: (origin, cb) =>
            !origin ||
            allowedOrigins.includes(normalizeOrigin(origin)) ||
            /^http:\/\/localhost:\d+$/.test(origin)
              ? cb(null, true)
              : cb(new Error("Not allowed by CORS")),
        }
      : undefined,
  ),
);

app.post(
  "/api/clerk",
  express.raw({ type: "application/json" }),
  clerkWebhooks,
);
app.post(
  "/api/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhooks,
);

// by claude: small JSON bodies only (images go through multer, not JSON)
app.use(express.json({ limit: "100kb" }));
app.use(clerkMiddleware());

// by claude: rate limits (webhooks above are not limited, Stripe/Clerk must always get through)
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { success: false, message: "Too many requests, please try again later" },
  }),
);
const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts, please try again later" },
});
app.use("/api/bookings/book", writeLimiter);
app.use("/api/bookings/stripe-payment", writeLimiter);
app.post("/api/reviews", writeLimiter);
app.patch("/api/reviews/:id", writeLimiter);
app.patch("/api/reviews/:id/reply", writeLimiter); // by claude // by claude (only creating, reading stays unlimited)

app.get("/", (req, res) => res.send("API IS WORKING"));
app.use("/api/users", userRouter);
app.use("/api/hotels", hotelRouter);
app.use("/api/rooms", roomRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/reviews", reviewRouter); // by claude

// by claude: unknown routes + one place for unexpected errors (no stack traces to the client)
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  const status = err.message === "Not allowed by CORS" ? 403 : err.status || 500;
  res.status(status).json({
    success: false,
    message: status === 500 ? "Something went wrong" : err.message,
  });
});

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;
