// by claude
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createReview,
  deleteReview,
  getHotelReviews,
  replyToReview, // by claude
  updateReview, // by claude
} from "../controllers/reviewController.js";

const reviewRouter = express.Router();

reviewRouter.post("/", protect, createReview);
reviewRouter.get("/hotel/:hotelId", getHotelReviews); // public
reviewRouter.patch("/:id", protect, updateReview); // by claude
reviewRouter.patch("/:id/reply", protect, replyToReview); // by claude
reviewRouter.delete("/:id", protect, deleteReview);

export default reviewRouter;
