const router = require("express").Router();
const axios = require("axios");

router.get("/", async (req, res) => {
  const PLACE_ID = process.env.GOOGLE_PLACE_ID;
  const API_KEY = process.env.GOOGLE_API_KEY;

  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/details/json`,
      {
        params: {
          place_id: PLACE_ID,
          fields: "name,rating,reviews",
          key: API_KEY,
          language: "es"
        },
      }
    );
    console.log("Google API response data:", response.data);

    const reviews = response.data?.result?.reviews || [];
    res.json(reviews);
  } catch (err) {
    console.error("Error fetching Google reviews:", err.response?.data || err.message);
    res.status(500).json({ error: "No se pudieron obtener las reseñas" });
  }
});

module.exports = router;
