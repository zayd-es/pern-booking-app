import API from "@/shared/lib/axios"; // by claude: every /api/users* request lives here

export const getUser = (config) => API.get("/api/users", config);
export const storeRecentSearch = (body, config) =>
  API.post("/api/users/store-recent-search", body, config);
