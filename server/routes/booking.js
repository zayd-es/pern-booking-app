import express from "express";
import {
  checkAvailabilityApi,
  cancelBooking, // by claude
  createBooking,
  getHotelBooking,
  getUserBookings,
  stripePayment,
} from "../controllers/bookingController.js";
import { protect } from "../middleware/authMiddleware.js";
const bookingRouter = express.Router();
bookingRouter.post("/check-availability", checkAvailabilityApi);
bookingRouter.post("/book", protect, createBooking);
bookingRouter.get("/user", protect, getUserBookings);
bookingRouter.get("/hotel", protect, getHotelBooking);
bookingRouter.post("/stripe-payment", protect, stripePayment);
bookingRouter.patch("/:id/cancel", protect, cancelBooking); // by claude

export default bookingRouter;
