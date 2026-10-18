import API from "@/shared/lib/axios"; // by claude: every /api/rooms* request lives here

export const getRooms = (config) => API.get("/api/rooms", config);
export const getRoomById = (id, config) => API.get(`/api/rooms/${id}`, config);
export const getOwnerRooms = (config) => API.get("/api/rooms/owner", config);
export const createRoom = (body, config) => API.post("/api/rooms", body, config);
export const updateRoom = (id, body, config) => API.patch(`/api/rooms/${id}`, body, config);
export const deleteRoom = (id, config) => API.delete(`/api/rooms/${id}`, config);
export const toggleRoomAvailability = (body, config) =>
  API.post("/api/rooms/toggle-availability", body, config);
