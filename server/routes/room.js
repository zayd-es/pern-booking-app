import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";
import {
  createRoom,
  deleteRoom,
  getOwnerRooms,
  getRooms,
  toggleRoomAvailability,
} from "../controllers/roomController.js";

const roomRouter = express.Router();
// by claude: protect first, so unauthenticated requests can't upload files to the server
roomRouter.post("/", protect, upload.array("images", 4), createRoom);
roomRouter.get("/", getRooms);
roomRouter.get("/owner", protect, getOwnerRooms);
roomRouter.delete("/:id", protect, deleteRoom);
roomRouter.post("/toggle-availability", protect, toggleRoomAvailability);
export default roomRouter;
