import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  registerHotel,
  getMyHotel, // by claude
  updateMyHotel, // by claude
  deleteMyHotel, // by claude
} from "../controllers/hotelController.js";

const hotelRouter = express.Router();

hotelRouter.post("/", protect, registerHotel);
hotelRouter.get("/mine", protect, getMyHotel);
hotelRouter.patch("/mine", protect, updateMyHotel);
hotelRouter.delete("/mine", protect, deleteMyHotel);

export default hotelRouter;
