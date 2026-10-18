import API from "@/shared/lib/axios"; // by claude: every /api/bookings* request lives here

export const getUserBookings = (config) => API.get("/api/bookings/user", config);
export const getHotelBookings = (config) => API.get("/api/bookings/hotel", config);
export const checkRoomAvailability = (body, config) =>
  API.post("/api/bookings/check-availability", body, config);
export const createBooking = (body, config) => API.post("/api/bookings/book", body, config);
export const createStripePayment = (body, config) =>
  API.post("/api/bookings/stripe-payment", body, config);
export const cancelBooking = (id, body, config) =>
  API.patch(`/api/bookings/${id}/cancel`, body, config);
