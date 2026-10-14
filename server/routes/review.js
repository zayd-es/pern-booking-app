// by claude
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createReview,
  deleteReview,
  getHotelReviews,
} from "../controllers/reviewController.js";

const reviewRouter = express.Router();

reviewRouter.post("/", protect, createReview);
reviewRouter.get("/hotel/:hotelId", getHotelReviews); // public
reviewRouter.delete("/:id", protect, deleteReview);

export default reviewRouter;
