import prisma from "../configs/prisma.js";

export const getUserData = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userSearchedCities = req.user.recentSearchedCities;
    return res.json({
      success: true,
      role: userRole,
      recentSearchedCities: userSearchedCities,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const storeRecentSearchedCities = async (req, res) => {
  try {
    const { recentSearchedCity } = req.body;
    const user = req.user;

    if (!recentSearchedCity || typeof recentSearchedCity !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "City name is required" });
    }

    let currentCities = user.recentSearchedCities || [];

    let updatedCities = currentCities.filter(
      (city) => city.toLowerCase() !== recentSearchedCity.toLowerCase(),
    );

    updatedCities.push(recentSearchedCity);

    if (updatedCities.length > 3) {
      updatedCities = updatedCities.slice(-3);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { recentSearchedCities: updatedCities },
    });

    return res.json({ success: true, message: "City added successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
