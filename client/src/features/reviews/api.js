import API from "@/shared/lib/axios"; // by claude: every /api/reviews* request lives here

export const getHotelReviews = (hotelId, config) => API.get(`/api/reviews/hotel/${hotelId}`, config);
export const createReview = (body, config) => API.post("/api/reviews", body, config);
export const updateReview = (id, body, config) => API.patch(`/api/reviews/${id}`, body, config);
export const replyToReview = (id, body, config) =>
  API.patch(`/api/reviews/${id}/reply`, body, config);
