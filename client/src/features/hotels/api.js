import API from "@/shared/lib/axios"; // by claude: every /api/hotels* request lives here

export const getHotels = (config) => API.get("/api/hotels", config);
export const getHotelStats = (config) => API.get("/api/hotels/stats", config);
export const getHotelById = (id, config) => API.get(`/api/hotels/${id}`, config);
export const createHotel = (body, config) => API.post("/api/hotels", body, config);
export const getMyHotel = (config) => API.get("/api/hotels/mine", config);
export const updateMyHotel = (body, config) => API.patch("/api/hotels/mine", body, config);
export const deleteMyHotel = (config) => API.delete("/api/hotels/mine", config);
