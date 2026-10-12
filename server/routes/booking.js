import express from "express";
import {
  checkAvailabilityApi,
  createBooking,
  getHotelBooking,
  getUserBookings,
} from "../controllers/bookingController.js";
import { protect } from "../middleware/authMiddleware.js";
const bookingRouter = express.Router();
bookingRouter.post("/check-availability", checkAvailabilityApi);
bookingRouter.post("/book", protect, createBooking);
bookingRouter.get("/user", protect, getUserBookings);
bookingRouter.get("/hotel", protect, getHotelBooking);

export default bookingRouter;
