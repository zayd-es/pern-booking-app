import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  registerHotel,
  getMyHotel, // by claude
  updateMyHotel, // by claude
  deleteMyHotel, // by claude
  getHotelById, // by claude
} from "../controllers/hotelController.js";

const hotelRouter = express.Router();

hotelRouter.post("/", protect, registerHotel);
hotelRouter.get("/mine", protect, getMyHotel);
hotelRouter.patch("/mine", protect, updateMyHotel);
hotelRouter.delete("/mine", protect, deleteMyHotel);
// by claude: public hotel page (must stay AFTER the "/mine" routes)
hotelRouter.get("/:id", getHotelById);

export default hotelRouter;
