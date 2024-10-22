require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Connect to MongoDB
mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err));

// Define the Weather Schema
const weatherSchema = new mongoose.Schema({
    city: String,
    temp: Number,
    feels_like: Number,
    main: String,
    dt: Date,
});

// Create the Weather Model
const Weather = mongoose.model("Weather", weatherSchema);

// Define the Daily Summary Schema with 'city' field
const dailySummarySchema = new mongoose.Schema({
    date: Date,
    city: String, // Added city field
    avgTemp: Number,
    maxTemp: Number,
    minTemp: Number,
    dominantCondition: String,
});

// Create the Daily Summary Model
const DailySummary = mongoose.model("DailySummary", dailySummarySchema);

// Function to fetch weather data
const fetchWeatherData = async () => {
    const cityCoords = {
        delhi: [28.6667, 77.2167],
        mumbai: [19.0144, 72.8479],
        chennai: [13.0878, 80.2785],
        bangalore: [12.9762, 77.6033],
        kolkata: [22.5697, 88.3697],
        hyderabad: [17.3753, 78.4744],
    };

    try {
        for (const [city, coords] of Object.entries(cityCoords)) {
            const response = await axios.get(
                `https://api.openweathermap.org/data/2.5/weather?lat=${coords[0]}&lon=${coords[1]}&appid=${process.env.OPENWEATHER_API_KEY}`
            );
            const weatherData = response.data;

            // Convert temperature from Kelvin to Celsius
            const tempCelsius = weatherData.main.temp - 273.15;
            const feelsLikeCelsius = weatherData.main.feels_like - 273.15;

            // Store the weather data in MongoDB
            const newWeather = new Weather({
                city,
                temp: tempCelsius.toFixed(2),
                feels_like: feelsLikeCelsius.toFixed(2),
                main: weatherData.weather[0].main,
                dt: new Date(weatherData.dt * 1000),
            });

            await newWeather.save();
        }
        console.log("Weather data fetched and stored successfully");
    } catch (error) {
        console.error("Error fetching weather data:", error);
    }
};

// Set an interval to fetch data every 5 minutes
const INTERVAL = 5 * 60 * 1000; // 5 minutes
setInterval(fetchWeatherData, INTERVAL);

// Daily summary calculation
const calculateDailySummary = async () => {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    // Loop through each city to calculate daily summary
    const cityCoords = {
        delhi: [28.6667, 77.2167],
        mumbai: [19.0144, 72.8479],
        chennai: [13.0878, 80.2785],
        bangalore: [12.9762, 77.6033],
        kolkata: [22.5697, 88.3697],
        hyderabad: [17.3753, 78.4744],
    };

    try {
        for (const city of Object.keys(cityCoords)) {
            const dailyWeather = await Weather.find({
                city: city.toLowerCase(),
                dt: { $gte: startOfDay, $lte: endOfDay },
            });

            if (dailyWeather.length === 0) continue;

            // Calculate aggregates
            const totalTemp = dailyWeather.reduce(
                (sum, record) => sum + record.temp,
                0
            );
            const maxTemp = Math.max(
                ...dailyWeather.map((record) => record.temp)
            );
            const minTemp = Math.min(
                ...dailyWeather.map((record) => record.temp)
            );

            const weatherCounts = dailyWeather.reduce((acc, record) => {
                acc[record.main] = (acc[record.main] || 0) + 1;
                return acc;
            }, {});

            const dominantWeather = Object.entries(weatherCounts).reduce(
                (a, b) => (b[1] > a[1] ? b : a)
            )[0];

            // Store the daily summary in the database
            const dailySummary = new DailySummary({
                date: new Date(),
                city: city.toLowerCase(), // Save the city
                avgTemp: (totalTemp / dailyWeather.length).toFixed(2),
                maxTemp: maxTemp,
                minTemp: minTemp,
                dominantCondition: dominantWeather,
            });

            await dailySummary.save();
            console.log(
                `Daily summary stored successfully for ${city}:`,
                dailySummary
            );
        }
    } catch (error) {
        console.error("Error calculating daily summary:", error);
    }
};

// Calculate daily summary at midnight
const midnight = new Date();
midnight.setHours(24, 0, 0, 0);
const timeToMidnight = midnight - new Date();
setTimeout(() => {
    calculateDailySummary();
    setInterval(calculateDailySummary, 24 * 60 * 60 * 1000); // every 24 hours
}, timeToMidnight);

// Define endpoint to fetch daily summary
app.get("/weather/summary", async (req, res) => {
    const { month, city, date } = req.query;

    // Validate month and city
    if (!month) {
        return res.status(400).json({ error: "month is required" });
    }

    if (!city) {
        return res.status(400).json({ error: "city is required" });
    }

    try {
        // Prepare the base query for filtering by month and city
        const query = {
            $and: [
                {
                    $expr: {
                        $eq: [
                            {
                                $month: {
                                    $dateFromString: { dateString: "$date" },
                                },
                            },
                            parseInt(month), // Ensure the month is an integer
                        ],
                    },
                },
                { city: city.toLowerCase() }, // Ensure case-insensitivity for city
            ],
        };

        // If a date is provided, filter data based on the date
        if (date) {
            // Validate the date format (YYYY-MM-DD)
            const datePattern = /^\d{4}-\d{2}-\d{2}$/;
            if (!datePattern.test(date)) {
                return res
                    .status(400)
                    .json({ error: "Invalid date format. Use YYYY-MM-DD." });
            }

            // Add date filtering to the query by only comparing the date part
            query.$and.push({
                $expr: {
                    $eq: [
                        {
                            $dateToString: {
                                format: "%Y-%m-%d",
                                date: "$date",
                            }, // Extract date part
                        },
                        date, // Compare with the provided date string
                    ],
                },
            });
        }

        // Fetch daily summaries from the database for the specified month and city (and optional date)
        const dailySummaries = await DailySummary.find(query);

        // If no summaries are found, return an appropriate message
        if (dailySummaries.length === 0) {
            return res.status(404).json({
                message:
                    "No daily summaries found for the specified month, city, and date.",
            });
        }

        // Return the found daily summaries
        return res.json(dailySummaries);
    } catch (error) {
        console.error("Error fetching daily summary:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Define endpoint to fetch weather data
app.get("/weather", async (req, res) => {
    const { appid, city, date } = req.query;

    // Validate appid and city
    if (!appid || !city) {
        return res.status(400).json({ error: "appid and city are required" });
    }

    try {
        // Fetch weather data from the database based on the city
        const weatherData = await Weather.find({ city: city.toLowerCase() }); // Ensure case-insensitivity

        // If a date is provided, filter data based on the date
        if (date) {
            // Validate the date format (YYYY-MM-DD)
            const datePattern = /^\d{4}-\d{2}-\d{2}$/;
            if (!datePattern.test(date)) {
                return res
                    .status(400)
                    .json({ error: "Invalid date format. Use YYYY-MM-DD." });
            }

            // Split the date string into parts
            const [year, month, day] = date.split("-").map(Number);

            // Create start and end dates for filtering
            const startDate = new Date(year, month - 1, day, 0, 0, 0); // Start of the day
            const endDate = new Date(year, month - 1, day, 23, 59, 59); // End of the day

            // Filter weather data by date range
            const filteredWeatherData = weatherData.filter(
                (data) => data.dt >= startDate && data.dt <= endDate
            );

            if (filteredWeatherData.length === 0) {
                return res.status(404).json({
                    message: "No weather data found for the specified date.",
                });
            }

            return res.json(filteredWeatherData);
        }

        res.json(weatherData);
    } catch (error) {
        console.error("Error fetching weather data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

const alertSchema = new mongoose.Schema({
    alertMessage: String,
    datetime: Date,
    city: String,
    maxThreshold: Number,
    minThreshold: Number,
    currentTemp: Number,
});

// Create the Alert Model
const Alert = mongoose.model("Alert", alertSchema);

// Define endpoint to create alerts based on temperature thresholds
app.get("/alerts", async (req, res) => {
    const { city, maxThreshold, minThreshold } = req.query;

    // Validate inputs
    if (!city || maxThreshold === undefined || minThreshold === undefined) {
        return res.status(400).json({
            error: "city, maxThreshold, and minThreshold are required.",
        });
    }

    const cityCoords = {
        delhi: [28.6667, 77.2167],
        mumbai: [19.0144, 72.8479],
        chennai: [13.0878, 80.2785],
        bangalore: [12.9762, 77.6033],
        kolkata: [22.5697, 88.3697],
        hyderabad: [17.3753, 78.4744],
    };

    // Check if the city exists in the coordinates
    const coords = cityCoords[city.toLowerCase()];
    if (!coords) {
        return res.status(404).json({ error: "City not found." });
    }

    try {
        // Fetch current weather data for the specified city
        const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?lat=${coords[0]}&lon=${coords[1]}&appid=${process.env.OPENWEATHER_API_KEY}`
        );
        const weatherData = response.data;

        // Convert temperature from Kelvin to Celsius
        const currentTemp = weatherData.main.temp - 273.15;

        // Check if the current temperature is outside the thresholds
        if (currentTemp > maxThreshold || currentTemp < minThreshold) {
            const alertMessage = `Alert! Temperature in ${city} is ${currentTemp.toFixed(
                2
            )}°C, which is outside the specified thresholds.`;
            const newAlert = new Alert({
                alertMessage,
                datetime: new Date(),
                city,
                maxThreshold,
                minThreshold,
                currentTemp: currentTemp.toFixed(2),
            });

            await newAlert.save();
            return res.json({
                message: "Alert created successfully.",
                alert: newAlert,
            });
        } else {
            return res.status(200).json({
                message: "Temperature is within the specified thresholds.",
            });
        }
    } catch (error) {
        console.error("Error fetching weather data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// In your Express server code
app.get("/alerts/summary", async (req, res) => {
    const { city, date } = req.query;
    //console.log(city, date);

    // Ensure date is a valid Date object
    const formattedDate = new Date(date);
    //console.log(formattedDate);

    if (isNaN(formattedDate)) {
        return res.status(400).json({ message: "Invalid date format." });
    }

    // Set the start and end of the day for the query
    const startOfDay = new Date(formattedDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(formattedDate.setHours(23, 59, 59, 999));

    try {
        const alerts = await Alert.find({
            city: city.toLowerCase(),
            datetime: {
                $gte: startOfDay,
                $lte: endOfDay,
            }, // Assuming 'datetime' is your date field in the Alert model
        });

        if (alerts.length === 0) {
            return res.status(404).json({
                message: "No alerts found for the specified city and date.",
            });
        }

        res.status(200).json(alerts);
    } catch (error) {
        console.error("Error fetching alerts:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
