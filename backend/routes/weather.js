const express = require("express");
const axios = require("axios");
const router = express.Router();

// List of Indian metro cities with their city IDs
const cities = [
    { name: "Delhi", id: 1273294 },
    { name: "Mumbai", id: 1275339 },
    { name: "Chennai", id: 1264527 },
    { name: "Bangalore", id: 1277333 },
    { name: "Kolkata", id: 1275004 },
    { name: "Hyderabad", id: 1269843 },
];

// Fetch weather data for each city
router.get("/weather", async (req, res) => {
    try {
        const apiKey = process.env.OPENWEATHER_API_KEY; // Make sure to set this in your .env file
        const cityWeatherData = [];

        for (const city of cities) {
            const response = await axios.get(
                `https://api.openweathermap.org/data/2.5/weather?id=${city.id}&appid=${apiKey}`
            );

            const weather = response.data;

            cityWeatherData.push({
                city: city.name,
                temp: (weather.main.temp - 273.15).toFixed(2), // Convert Kelvin to Celsius
                feels_like: (weather.main.feels_like - 273.15).toFixed(2),
                main: weather.weather[0].main,
                dt: weather.dt,
            });
        }

        res.json(cityWeatherData);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch weather data" });
    }
});

module.exports = router;
